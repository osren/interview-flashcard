const { groupByProject } = require('./parser');

/**
 * @param {Array<import('./types').SessionStats>} sessions
 * @returns {Array<import('./types').ProjectStats>}
 */
function analyzeProjects(sessions) {
  const grouped = groupByProject(sessions);
  const projects = [];

  for (const [projectPath, projectSessions] of grouped) {
    const name = projectSessions[0]?.projectName || projectPath.split('/').pop() || projectPath;

    let totalInput = 0;
    let totalOutput = 0;
    let totalCacheRead = 0;
    let totalCacheCreate = 0;
    let totalMessages = 0;
    let totalToolCalls = 0;
    let totalSubagentCount = 0;
    const skills = {};
    const tools = {};
    const models = {};
    const subagentTypes = {};

    let firstDate = Infinity;
    let lastDate = -Infinity;

    for (const s of projectSessions) {
      totalInput += s.inputTokens;
      totalOutput += s.outputTokens;
      totalCacheRead += s.cacheReadTokens;
      totalCacheCreate += s.cacheCreationTokens;
      totalMessages += s.messageCount;
      totalToolCalls += s.toolUseCount;
      totalSubagentCount += s.subagentCount || 0;

      const ts = s.date.getTime();
      if (ts < firstDate) firstDate = ts;
      if (ts > lastDate) lastDate = ts;

      // Aggregate skills
      for (const [skillName, count] of Object.entries(s.skillCalls)) {
        if (!skills[skillName]) {
          skills[skillName] = { name: skillName, callCount: 0, totalInputTokens: 0, totalOutputTokens: 0 };
        }
        skills[skillName].callCount += count;
        skills[skillName].totalInputTokens += s.inputTokens; // approximate: distribute session tokens across skills
        skills[skillName].totalOutputTokens += s.outputTokens;
      }

      // Aggregate tools
      for (const [toolName, info] of Object.entries(s.toolCalls)) {
        if (!tools[toolName]) {
          tools[toolName] = { name: toolName, callCount: 0, successCount: 0, errorCount: 0 };
        }
        tools[toolName].callCount += info.callCount;
      }

      // Aggregate models
      for (const m of s.models) {
        models[m] = (models[m] || 0) + 1;
      }

      // Aggregate subagent types
      for (const sa of s.subagents || []) {
        const type = sa.agentType || 'unknown';
        subagentTypes[type] = (subagentTypes[type] || 0) + 1;
      }
    }

    projects.push({
      name,
      path: projectPath,
      sessionCount: projectSessions.length,
      totalMessages,
      totalInputTokens: totalInput,
      totalOutputTokens: totalOutput,
      totalCacheReadTokens: totalCacheRead,
      totalCacheCreationTokens: totalCacheCreate,
      totalTokens: totalInput + totalOutput + totalCacheRead + totalCacheCreate,
      totalToolCalls,
      totalSubagentCount,
      subagentTypes,
      firstSessionDate: firstDate === Infinity ? 0 : firstDate,
      lastSessionDate: lastDate === -Infinity ? 0 : lastDate,
      skills,
      tools,
      models,
      sessions: projectSessions,
    });
  }

  // Sort by total tokens descending
  projects.sort((a, b) => b.totalTokens - a.totalTokens);
  return projects;
}

/**
 * Compute global summary across all projects
 * @param {Array<import('./types').ProjectStats>} projects
 */
function computeGlobalSummary(projects) {
  let totalSessions = 0;
  let totalMessages = 0;
  let totalInput = 0;
  let totalOutput = 0;
  let totalCacheRead = 0;
  let totalCacheCreate = 0;
  let totalToolCalls = 0;
  let totalSubagentCount = 0;
  const globalSkills = {};
  const globalTools = {};
  const globalModels = {};
  const globalSubagentTypes = {};

  for (const p of projects) {
    totalSessions += p.sessionCount;
    totalMessages += p.totalMessages;
    totalInput += p.totalInputTokens;
    totalOutput += p.totalOutputTokens;
    totalCacheRead += p.totalCacheReadTokens;
    totalCacheCreate += p.totalCacheCreationTokens;
    totalToolCalls += p.totalToolCalls;
    totalSubagentCount += p.totalSubagentCount || 0;

    for (const [name, info] of Object.entries(p.skills)) {
      if (!globalSkills[name]) globalSkills[name] = { name, callCount: 0, projects: new Set() };
      globalSkills[name].callCount += info.callCount;
      globalSkills[name].projects.add(p.name);
    }

    for (const [name, info] of Object.entries(p.tools)) {
      if (!globalTools[name]) globalTools[name] = { name, callCount: 0 };
      globalTools[name].callCount += info.callCount;
    }

    for (const [name, count] of Object.entries(p.models)) {
      globalModels[name] = (globalModels[name] || 0) + count;
    }

    for (const [type, count] of Object.entries(p.subagentTypes || {})) {
      globalSubagentTypes[type] = (globalSubagentTypes[type] || 0) + count;
    }
  }

  // Convert Sets to counts
  for (const s of Object.values(globalSkills)) {
    s.projectCount = s.projects.size;
    delete s.projects;
  }

  return {
    projectCount: projects.length,
    totalSessions,
    totalMessages,
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalCacheReadTokens: totalCacheRead,
    totalCacheCreationTokens: totalCacheCreate,
    totalTokens: totalInput + totalOutput + totalCacheRead + totalCacheCreate,
    totalToolCalls,
    totalSubagentCount,
    topSkills: Object.values(globalSkills).sort((a, b) => b.callCount - a.callCount).slice(0, 10),
    topTools: Object.values(globalTools).sort((a, b) => b.callCount - a.callCount).slice(0, 10),
    topSubagentTypes: Object.entries(globalSubagentTypes)
      .map(([name, callCount]) => ({ name, callCount }))
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, 10),
    models: globalModels,
  };
}

module.exports = { analyzeProjects, computeGlobalSummary };
