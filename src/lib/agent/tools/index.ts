import {
  getApplicationProgressTool,
  getProgressStatsTool,
  getStageRemindersTool,
} from './progress';
import { getJobDetailTool, searchJobsTool } from './jobs';
import { completeStageTool, setJobStatusTool } from './actions';
import type { AgentToolDefinition } from '../types';

/** 只读工具：查岗位库、投递进度与测评面试提醒 */
export const campusJobTools: AgentToolDefinition[] = [
  getProgressStatsTool,
  getStageRemindersTool,
  searchJobsTool,
  getJobDetailTool,
  getApplicationProgressTool,
];

/** 写工具：统一 requiresConfirm，由 UI 二次确认后执行 */
export const campusJobWriteTools: AgentToolDefinition[] = [setJobStatusTool, completeStageTool];

/** Agent 面板实际注册的工具集合 */
export const agentTools: AgentToolDefinition[] = [...campusJobTools, ...campusJobWriteTools];
