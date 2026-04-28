export const CLAUSES = [
  'Intellectual property ownership',
  'Limitation of liability',
  'Warranty disclaimer',
  'Indemnification',
  'Data processing terms',
  'Termination for convenience',
  'Non-solicitation',
  'Payment terms',
  'Confidentiality',
] as const 

export type ClauseName = (typeof CLAUSES)[number]

// New type to handle the classification tags from the prototype 
export type ClauseType = 'risk' | 'key' | 'standard' | 'none'; 

// Updated to match the data structure required for tagging 
export interface ClauseData {
  text: string;
  type: ClauseType;
}

// ClauseMap now maps to the ClauseData object instead of just a string
export type ClauseMap = Record<ClauseName, ClauseData>

export type ContractStatus = 'pending' | 'analyzing' | 'done' | 'error'

export interface ContractResult {
  id: string
  name: string
  status: ContractStatus
  clauses?: ClauseMap
  error?: string
}