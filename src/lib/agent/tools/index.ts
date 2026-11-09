import { getApplicationProgressTool, getProgressStatsTool } from './progress';
import { getJobDetailTool, searchJobsTool } from './jobs';
import type { AgentToolDefinition } from '../types';

/** 秋招模块当前对外开放的只读工具集合 */
export const campusJobTools: AgentToolDefinition[] = [
  getProgressStatsTool,
  searchJobsTool,
  getJobDetailTool,
  getApplicationProgressTool,
];
