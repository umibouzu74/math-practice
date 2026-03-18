export interface Chapter {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface Formula {
  id: string;
  category: string;
  name: string;
  formula: string;
  example?: string;
  note?: string;
}

export interface Term {
  id: string;
  term: string;
  definition: string;
  example?: string;
}

export interface Pattern {
  id: string;
  problem: string;
  prompt: string;
  correct: string;
  options: string[];
  explanation: string;
}

export interface Problem {
  id: string;
  problem: string;
  hints: string[];
  solution: string;
  steps: string[];
}

export interface ChapterData {
  id: string;
  formulas: Formula[];
  terms: Term[];
  patterns: Pattern[];
  problems: Problem[];
}

export interface StudyRecord {
  chapterId: string;
  mode: 'reference' | 'formula' | 'term' | 'pattern' | 'practice' | 'dashboard';
  date: string;
  total: number;
  correct: number;
  ratings?: {
    good: number;
    ok: number;
    bad: number;
  };
}

export type Mode = 'reference' | 'formula' | 'term' | 'pattern' | 'practice' | 'dashboard';
