import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { CLAUSES } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Instructs Claude on the classification logic to match your prototype [cite: 3, 18]
const SYSTEM_PROMPT = `You are a precise legal contract analyst. Your goal is to extract specific clauses and categorize their impact.
For each clause:
1. Extract a concise, human-like summary or quote the key part of the text. [cite: 3, 5]
2. Categorize the clause as:
   - 'risk': Unfavorable, aggressive, or high-liability terms.
   - 'key': Noteworthy, unusual, or specifically important terms.
   - 'standard': Market-norm or boilerplate terms.
   - 'none': Use only if the clause is not found.

If a clause does not exist, respond with "No Data Found" for text and "none" for type. [cite: 4]`

function buildPrompt(contractText: string) {
  const clauseList = CLAUSES.map((c, i) => `${i + 1}. ${c}`).join('\n')
  return `Review this contract and extract the following clauses. Categorize each based on its legal impact. [cite: 3, 18]

Clauses to extract:
${clauseList}

Respond ONLY with a valid JSON object. No markdown, no preamble. 
Format each entry as an object with "text" and "type".

Example Format:
{
  "clauses": {
    "Intellectual property ownership": { "text": "...", "type": "standard" },
    ...
  }
}

CONTRACT TEXT:
${contractText}`
}

async function extractPDFText(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)
  return data.text
}

async function extractDOCXText(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured.' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const text = formData.get('text') as string | null

    let contractText = ''

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const name = file.name.toLowerCase()

      if (name.endsWith('.pdf')) {
        contractText = await extractPDFText(buffer)
      } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
        contractText = await extractDOCXText(buffer)
      } else {
        return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 })
      }
    } else if (text) {
      contractText = text
    }

    if (!contractText.trim()) {
      return NextResponse.json({ error: 'No text provided.' }, { status: 400 })
    }

    // Using your specified Claude model
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514', 
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPrompt(contractText) }],
    })

    const rawText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    // Improved JSON extraction to prevent "Analysis failed" caused by preamble text
    const startIdx = rawText.indexOf('{')
    const endIdx = rawText.lastIndexOf('}')
    
    if (startIdx === -1 || endIdx === -1) {
      throw new Error("AI did not return a valid JSON object structure.")
    }

    const jsonString = rawText.substring(startIdx, endIdx + 1)
    const parsed = JSON.parse(jsonString)

    // Ensures the response contains the nested "clauses" key expected by ResultsTable
    const finalData = parsed.clauses ? parsed : { clauses: parsed }

    return NextResponse.json(finalData)
  } catch (err: unknown) {
    console.error('Analyze error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}