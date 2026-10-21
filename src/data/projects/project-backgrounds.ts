import didiPerformanceBackground from './backgrounds/didi-performance.md?raw';
import aiMonitorBackground from './backgrounds/ai-monitor.md?raw';
import didiInternshipBackground from './backgrounds/didi-internship.md?raw';
import comprehensiveInterviewSource from './backgrounds/comprehensive-interview-source.md?raw';

/** Project context is rendered as Markdown, separate from flashcards. */
export const projectBackgrounds: Record<string, string> = {
  'didi-performance': didiPerformanceBackground,
  'ai-monitor': aiMonitorBackground,
  'didi-interview-guide': didiInternshipBackground,
  'comprehensive-interview': comprehensiveInterviewSource,
};
