import type { ApplicationStatus, JobCategory, JobTier, RejectReason } from '@/types/campus-job';

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'screen',
  'interview',
  'offer',
];

export const APPLICATION_STATUS_ALL: ApplicationStatus[] = [
  ...APPLICATION_STATUS_ORDER,
  'rejected',
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: '已投递',
  screen: '筛选中',
  interview: '面试中',
  offer: '已录用',
  rejected: '已终止',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: '#1CB0F6',
  screen: '#FFC800',
  interview: '#CE82FF',
  offer: '#58CC02',
  rejected: '#FF4B4B',
};

export const REJECT_REASON_ORDER: RejectReason[] = [
  'screen_fail',
  'interview_1',
  'interview_2',
  'interview_3',
  'hr_fail',
  'lateral',
];

export const REJECT_REASON_LABELS: Record<RejectReason, string> = {
  screen_fail: '未通过筛选',
  interview_1: '一面挂',
  interview_2: '二面挂',
  interview_3: '三面挂',
  hr_fail: 'HR面挂',
  lateral: '被横向',
};

export function formatApplicationStatusLabel(
  status: ApplicationStatus,
  rejectReason?: RejectReason | null
): string {
  if (status === 'rejected') {
    if (rejectReason && REJECT_REASON_LABELS[rejectReason]) {
      return `已终止 · ${REJECT_REASON_LABELS[rejectReason]}`;
    }
    return '已终止';
  }
  return APPLICATION_STATUS_LABELS[status];
}

export function isRejectReason(value: unknown): value is RejectReason {
  return typeof value === 'string' && REJECT_REASON_ORDER.includes(value as RejectReason);
}

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  frontend: '前端开发',
  agent_dev: 'Agent 应用',
  ai_fullstack: 'AI 全栈',
  ai_app: 'AI 应用',
  other: '其他',
};

export const JOB_CATEGORY_ORDER: JobCategory[] = [
  'agent_dev',
  'ai_fullstack',
  'ai_app',
  'frontend',
  'other',
];

export const TIER_CONFIG: Record<
  JobTier,
  { label: string; emoji: string; description: string; minConf?: number }
> = {
  S: { label: '最高优先级', emoji: '⭐⭐⭐', description: 'confidence ≥ 0.95', minConf: 0.95 },
  A: { label: '高优先级', emoji: '⭐⭐', description: '0.90 – 0.94', minConf: 0.9 },
  B: { label: '备选', emoji: '⭐', description: '0.80 – 0.89', minConf: 0.8 },
  edge: { label: '边缘', emoji: '⚠️', description: '0.76 – 0.79', minConf: 0.76 },
  skip: { label: '跳过', emoji: '❌', description: '方向不匹配' },
};

export const COMPANY_COLORS = [
  { name: '蓝色', value: 'blue' },
  { name: '绿色', value: 'green' },
  { name: '橙色', value: 'orange' },
  { name: '黄色', value: 'yellow' },
  { name: '紫色', value: 'purple' },
  { name: '红色', value: 'red' },
  { name: '粉色', value: 'pink' },
  { name: '青色', value: 'cyan' },
  { name: '灰色', value: 'gray' },
];

export const COMPANY_COLOR_GRADIENT: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  yellow: 'from-yellow-500 to-yellow-600',
  purple: 'from-purple-500 to-purple-600',
  red: 'from-red-500 to-red-600',
  pink: 'from-pink-500 to-pink-600',
  cyan: 'from-cyan-500 to-cyan-600',
  gray: 'from-gray-500 to-gray-600',
};

export function getTierFromMatch(qualified: boolean, confidence: number): JobTier {
  if (!qualified) return 'skip';
  if (confidence >= 0.95) return 'S';
  if (confidence >= 0.9) return 'A';
  if (confidence >= 0.8) return 'B';
  if (confidence >= 0.76) return 'edge';
  return 'skip';
}

export function getStatusIndex(status: ApplicationStatus): number {
  if (status === 'rejected') return APPLICATION_STATUS_ORDER.length;
  return APPLICATION_STATUS_ORDER.indexOf(status);
}
