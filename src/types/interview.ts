export type InterviewStatus = 'waiting' | 'passed' | 'failed';

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface InterviewSession {
  id: string;
  name: string; // 场次名称，如"一面"、"二面"、"HR面"
  date: string; // 日期标记
  status: InterviewStatus;
  questions: InterviewQuestion[];
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
