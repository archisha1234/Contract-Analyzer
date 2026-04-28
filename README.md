# Contract Review — AI-Powered Clause Extractor

Upload PDF or DOCX contracts (or paste text) and get 9 key legal clauses extracted into a clean table.

## Clauses extracted
- Intellectual property ownership
- Limitation of liability
- Warranty disclaimer
- Indemnification
- Data processing terms
- Termination for convenience
- Non-solicitation
- Payment terms
- Confidentiality

---

## Local setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Anthropic API key
Edit `.env.local` and replace the placeholder:
```
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
```
Get your key at https://console.anthropic.com

### 3. Run the dev server
```bash
npm run dev
```
Visit http://localhost:3000

---

## Deploy to Vercel

1. Push this project to a GitHub repo
2. Go to https://vercel.com → New Project → import your repo
3. Add environment variable: `ANTHROPIC_API_KEY` = your key
4. Deploy

---

## Features
- **Intelligent Extraction:** Automatically identifies 9 critical legal clauses from dense contract text.
- **Risk Categorization:** Each clause is analyzed and assigned a legal impact status:
  - <span style="color:#ff9595">●</span> **Risk:** High-liability or aggressive terms.
  - <span style="color:#ffca85">●</span> **Key Term:** Noteworthy or unusual provisions.
  - <span style="color:#95ff95">●</span> **Standard:** Market-norm boilerplate language.
- **Contextual View:** Clickable table cells allow users to view the full, original text of each extracted clause in a modal overlay.

## Tech stack
- **Next.js 14** (App Router)
- **Anthropic SDK** — claude-sonnet-4 for clause extraction
- **mammoth** — DOCX → text extraction
- **pdf-parse** — PDF → text extraction
- **Tailwind CSS** — utility styling

## Notes
- PDF files must have selectable text (not scanned images)
- Files are processed server-side — your API key is never exposed to the browser
- Documents over 80,000 characters are trimmed before sending to the API
