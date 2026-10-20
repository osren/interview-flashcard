import type { InterviewQuestion } from '@/types/interview';

export function questionsToInterviewMarkdown(
  questions: Pick<InterviewQuestion, 'question' | 'answer'>[],
  title: string
) {
  const intro = `# ${title}\n\n## 一、面试问答\n`;
  if (questions.length === 0) return `${intro}\n\n## 二、复盘与改进\n`;

  const entries = questions.map((item, index) => {
    const question = item.question.trim() || `问题 ${index + 1}`;
    const answer = item.answer.trim() || '（暂未记录回答）';
    let insideCodeFence = false;
    const normalizedAnswer = answer.split(/\r?\n/).map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        insideCodeFence = !insideCodeFence;
        return line;
      }
      if (insideCodeFence) return line;
      const heading = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/);
      if (!heading) return line;
      const headingText = heading[1].trim();
      const numberedPoint = headingText.match(/^(\d+)(?:[.、)）])\s*(.+)$/);
      if (numberedPoint) return `\n\n#### ${numberedPoint[1]}) ${numberedPoint[2]}\n\n`;
      return headingText ? `\n\n**${headingText}**\n\n` : '';
    }).join('\n');
    return `### ${index + 1}. ${question}\n\n${normalizedAnswer}`;
  });

  return `${intro}\n\n${entries.join('\n\n---\n\n')}\n\n## 二、复盘与改进\n`;
}

export function createInterviewStarterMarkdown(title: string) {
  return `# ${title}\n\n## 一、面试概览\n\n- 面试岗位：\n- 面试日期：\n- 面试结果：\n\n## 二、面试问答\n\n### 1. （填写面试问题）\n\n先用正文概括回答结论，再补充必要的背景、原理和实际经历。\n\n#### 1) 核心要点\n- 要点一\n- 要点二\n\n#### 2) 实现或分析步骤\n- 步骤一\n- 步骤二\n\n## 三、复盘与改进\n\n- 表现较好的部分：\n- 需要补充的知识：\n- 下一步行动：\n`;
}
