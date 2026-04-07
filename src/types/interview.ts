// 面经模块的类型定义
export type InterviewStatus = 'waiting' | 'passed' | 'failed';

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface InterviewSession {
  id: string;
  name: string;
  date: string;
  status: InterviewStatus;
  questions: InterviewQuestion[];
}

export interface InterviewDepartment {
  id: string;
  name: string;
  sessions: InterviewSession[];
}

export interface InterviewCompany {
  id: string;
  name: string;
  color: string;
  departments: InterviewDepartment[];
}

// 导出所有类型供外部使用
export type Company = InterviewCompany;
export type Department = InterviewDepartment;
export type Session = InterviewSession;
export type Question = InterviewQuestion;