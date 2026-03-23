export interface Lab {
  id: string;
  title: string;
  level: number;
  category: 'reflected' | 'stored' | 'dom' | 'filter-bypass' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  objectives: string[];
  theory: string;
  hints: Hint[];
  solution: Solution;
  vulnerableCode: string;
  context: 'html' | 'attribute' | 'javascript' | 'url' | 'css' | 'mixed';
}

export interface Hint {
  level: number;
  title: string;
  content: string;
}

export interface Solution {
  explanation: string;
  source: string;
  sink: string;
  context: string;
  payload: string;
  why: string;
  fix: string;
  fixCode: string;
}

export interface TheorySection {
  id: string;
  title: string;
  content: string;
  order: number;
  subsections?: TheorySubsection[];
}

export interface TheorySubsection {
  title: string;
  content: string;
  codeExamples?: CodeExample[];
  videoUrl?: string;
  videoTitle?: string;
  exercises?: Exercise[];
}

export interface CodeExample {
  title: string;
  code: string;
  explanation?: string;
}

export interface Exercise {
  question: string;
  answer: string;
}

export interface UserProgress {
  labId: string;
  completed: boolean;
  attempts: number;
  hintsUsed: number;
  completedAt?: string;
}

export interface LabResult {
  success: boolean;
  message: string;
  executedPayload?: string;
}

export interface PayloadTest {
  context: string;
  input: string;
  output: string;
  encoded: string;
  safe: string;
}
