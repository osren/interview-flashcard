export type InterviewStatus = 'waiting' | 'passed' | 'failed';

/** 掌握度：0 生疏、1 有印象、2 熟练、3 精通 */
export type MasteryLevel = 0 | 1 | 2 | 3;

export const MASTERY_LEVELS: MasteryLevel[] = [0, 1, 2, 3];

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: '生疏',
  1: '有印象',
  2: '熟练',
  3: '精通',
};

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
}

/** 生成面经时注入的简历来源：上传的 PDF 或 Markdown 简历 */
export interface InterviewResumeSource {
  kind: 'pdf' | 'markdown';
  id: string;
}

export interface InterviewSession {
  id: string;
  name: string; // 场次名称，如"一面"、"二面"、"HR面"
  date: string; // 日期标记
  status: InterviewStatus;
  questions: InterviewQuestion[];
  markdownContent?: string;
  /** 按题目 id 记录掌握度；缺省视为未标记，不参与统计 */
  mastery?: Record<string, MasteryLevel>;
  /** 最近一次内容写入时间，云端合并时取较新的一份 */
  updatedAt?: number;
}

export interface Department {
  id: string;
  name: string;
  sessions: InterviewSession[];
}

export interface Company {
  id: string;
  name: string;
  color: string;
  departments: Department[];
}
