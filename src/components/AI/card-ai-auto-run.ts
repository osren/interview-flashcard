const inflightAutoRuns = new Map<string, Promise<void>>();

export function isCardAiAutoRunInflight(key: string): boolean {
  return inflightAutoRuns.has(key);
}

export function runCardAiAutoRunOnce(key: string, task: () => Promise<void>): void {
  if (inflightAutoRuns.has(key)) return;
  const promise = task().finally(() => {
    inflightAutoRuns.delete(key);
  });
  inflightAutoRuns.set(key, promise);
}

export function clearCardAiAutoRun(key: string): void {
  inflightAutoRuns.delete(key);
}
