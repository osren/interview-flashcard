/**
 * Time-based trend analysis
 */

/**
 * @param {Array<import('./types').SessionStats>} sessions
 * @returns {Array<{date: string, sessions: number, inputTokens: number, outputTokens: number, cacheReadTokens: number, cacheCreationTokens: number, totalTokens: number, toolCalls: number}>>
 */
function analyzeDailyTrends(sessions) {
  const daily = {};

  for (const s of sessions) {
    const dateKey = s.date.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!daily[dateKey]) {
      daily[dateKey] = {
        date: dateKey,
        sessions: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        totalTokens: 0,
        toolCalls: 0,
      };
    }
    daily[dateKey].sessions++;
    daily[dateKey].inputTokens += s.inputTokens;
    daily[dateKey].outputTokens += s.outputTokens;
    daily[dateKey].cacheReadTokens += s.cacheReadTokens;
    daily[dateKey].cacheCreationTokens += s.cacheCreationTokens;
    daily[dateKey].totalTokens += s.totalTokens;
    daily[dateKey].toolCalls += s.toolUseCount;
  }

  return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * @param {Array<import('./types').SessionStats>} sessions
 * @returns {Array<{week: string, sessions: number, inputTokens: number, outputTokens: number, totalTokens: number, toolCalls: number}>>
 */
function analyzeWeeklyTrends(sessions) {
  const weekly = {};

  for (const s of sessions) {
    const d = s.date;
    const year = d.getFullYear();
    const week = getWeekNumber(d);
    const key = `${year}-W${String(week).padStart(2, '0')}`;

    if (!weekly[key]) {
      weekly[key] = {
        week: key,
        sessions: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        totalTokens: 0,
        toolCalls: 0,
      };
    }
    weekly[key].sessions++;
    weekly[key].inputTokens += s.inputTokens;
    weekly[key].outputTokens += s.outputTokens;
    weekly[key].cacheReadTokens += s.cacheReadTokens;
    weekly[key].cacheCreationTokens += s.cacheCreationTokens;
    weekly[key].totalTokens += s.totalTokens;
    weekly[key].toolCalls += s.toolUseCount;
  }

  return Object.values(weekly).sort((a, b) => a.week.localeCompare(b.week));
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Cache efficiency analysis
 * @param {Array<import('./types').ProjectStats>} projects
 */
function analyzeCacheEfficiency(projects) {
  const totalRead = projects.reduce((s, p) => s + p.totalCacheReadTokens, 0);
  const totalCreate = projects.reduce((s, p) => s + p.totalCacheCreationTokens, 0);
  const totalInput = projects.reduce((s, p) => s + p.totalInputTokens, 0);

  const cacheHitRate = totalInput > 0 ? (totalRead / (totalRead + totalInput)) : 0;
  const cacheWriteRatio = totalInput > 0 ? (totalCreate / totalInput) : 0;

  return {
    totalCacheReadTokens: totalRead,
    totalCacheCreationTokens: totalCreate,
    cacheHitRate,
    cacheWriteRatio,
    estimatedCostSavings: totalRead * 0.0000003, // Approximate: cached tokens are cheaper
  };
}

module.exports = { analyzeDailyTrends, analyzeWeeklyTrends, analyzeCacheEfficiency };
