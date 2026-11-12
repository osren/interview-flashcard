import { describe, expect, it, vi } from 'vitest';
import type { ResumeSyncPayload } from '../resume-sync';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {},
  isSupabaseConfigured: false,
}));

vi.mock('@/store/useResumeStore', () => ({
  DEFAULT_INTRO_SCRIPT: '默认口述稿',
  RESUME_PRIMARY_ID: 'resume-primary',
  defaultPrimaryMarkdown: {
    id: 'resume-primary',
    title: '通用精简版',
    content: '# 通用',
    createdAt: 1,
  },
  useResumeStore: {
    getState: () => ({
      getSyncPayload: () => ({
        resumes: [
          {
            id: 'pdf-byte',
            name: '谭成_字节投递',
            data: 'data:application/pdf;base64,JVBERi0xLjQK',
            uploadTime: 1000,
            extractedText: '谭成 · 前端开发工程师',
          },
        ],
        introScript: '默认口述稿',
        markdownResumes: [
          { id: 'resume-primary', title: '通用精简版', content: '# 通用', createdAt: 1 },
        ],
        primaryResumeId: 'resume-primary',
      }),
      importSyncedState: vi.fn(),
    }),
  },
}));

import { buildResumeSyncPayload, mergeResumePayload } from '../resume-sync';

const payload = (overrides: Partial<ResumeSyncPayload> = {}): ResumeSyncPayload => ({
  resumes: [],
  introScript: '默认口述稿',
  markdownResumes: [{ id: 'resume-primary', title: '通用精简版', content: '# 通用', createdAt: 1 }],
  primaryResumeId: 'resume-primary',
  ...overrides,
});

describe('resume sync payload', () => {
  it('上传到云端时剥离 PDF 原件，避免超出 Supabase 请求体积', () => {
    const built = buildResumeSyncPayload();
    expect(built.resumes).toHaveLength(1);
    expect(built.resumes[0].data).toBe('');
    // 文本与元信息仍然保留，面经 / JD 优化在别的设备也能用
    expect(built.resumes[0].extractedText).toBe('谭成 · 前端开发工程师');
    expect(built.resumes[0].name).toBe('谭成_字节投递');
    expect(built.resumes[0].uploadTime).toBe(1000);
  });

  it('合并时用本地原件补回远端缺失的 data', () => {
    const local = payload({
      resumes: [
        { id: 'pdf-byte', name: '谭成_字节投递', data: 'data:application/pdf;base64,JVBERi0xLjQK', uploadTime: 1000, extractedText: '谭成 · 前端开发工程师' },
      ],
    });
    const remote = payload({
      resumes: [{ id: 'pdf-byte', name: '谭成_字节投递', data: '', uploadTime: 1000, extractedText: '谭成 · 前端开发工程师' }],
    });

    const merged = mergeResumePayload(local, remote);
    expect(merged.resumes).toHaveLength(1);
    expect(merged.resumes[0].data).toBe('data:application/pdf;base64,JVBERi0xLjQK');
  });

  it('远端新增的简历只保留文本，本地没有原件时不伪造 data', () => {
    const local = payload();
    const remote = payload({
      resumes: [{ id: 'pdf-remote', name: '另一台设备上传', data: '', uploadTime: 2000, extractedText: '另一台设备的简历正文' }],
    });

    const merged = mergeResumePayload(local, remote);
    expect(merged.resumes).toHaveLength(1);
    expect(merged.resumes[0].data).toBe('');
    expect(merged.resumes[0].extractedText).toBe('另一台设备的简历正文');
  });

  it('本地更新的简历优先，且不会被远端的空 data 覆盖', () => {
    const local = payload({
      resumes: [{ id: 'pdf-byte', name: '重传版', data: 'data:application/pdf;base64,QUJD', uploadTime: 3000, extractedText: '新正文' }],
    });
    const remote = payload({
      resumes: [{ id: 'pdf-byte', name: '旧版', data: '', uploadTime: 1000, extractedText: '旧正文' }],
    });

    const merged = mergeResumePayload(local, remote);
    expect(merged.resumes[0].name).toBe('重传版');
    expect(merged.resumes[0].data).toBe('data:application/pdf;base64,QUJD');
    expect(merged.resumes[0].uploadTime).toBe(3000);
  });

  it('远端为空时直接返回本地快照，不做任何裁剪', () => {
    const local = payload({
      resumes: [{ id: 'pdf-byte', name: '谭成_字节投递', data: 'data:application/pdf;base64,QUJD', uploadTime: 1000 }],
    });
    expect(mergeResumePayload(local, null)).toBe(local);
  });
});
