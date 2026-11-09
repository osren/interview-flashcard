import { afterEach, describe, expect, it, vi } from 'vitest';

describe('agent feature flag', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('线上没有配置这个变量时默认开启（.env 不入库，云端构建拿不到）', async () => {
    vi.stubEnv('VITE_AGENT_ENABLED', '');
    vi.resetModules();
    const mod = await import('../feature');
    expect(mod.AGENT_ENABLED).toBe(true);
    expect(mod.shouldMountAgentPanel()).toBe(true);
  });

  it('只有显式 false 才关闭', async () => {
    vi.stubEnv('VITE_AGENT_ENABLED', 'false');
    vi.resetModules();
    const mod = await import('../feature');
    expect(mod.AGENT_ENABLED).toBe(false);
  });
});
