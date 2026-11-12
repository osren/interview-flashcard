import { describe, expect, it } from 'vitest';
import type { InterviewQuestion } from '@/types/interview';
import {
  buildInterviewGuideMessages,
  parseInterviewGuideMarkdown,
  summariseMastery,
} from '../interview-guide';

const SAMPLE = `# 字节跳动 · 前端开发工程师 - APM · 技术一面

## 一、面试问答

### 1. 自我介绍

**结论**：按「实习经历 → 项目 → 求职动机」三段讲。

- **项目主线**：以商旅性能监控作为开场，突出可观测性经验。

### 2. LCP 从 3.4s 降到 2.1s 做了什么

**结论**：先拆耗时桶，再砍非关键路径。

- **三桶拆分**：按 fetch / render / paint 拆分，定位渲染耗时被误计入接口耗时。

\`\`\`js
const lcp = new PerformanceObserver((list) => { /* 采集 */ });
\`\`\`

- **非关键路径**：privacyPopList 用 defer 延后加载。

## 二、复盘与改进

- 表现较好：性能问答有数据支撑。
`;

describe('parseInterviewGuideMarkdown', () => {
  it('按三级标题解析出题目与答案', () => {
    const questions = parseInterviewGuideMarkdown(SAMPLE);

    expect(questions).toHaveLength(2);
    expect(questions[0].question).toBe('自我介绍');
    expect(questions[0].answer).toContain('项目主线');
    expect(questions[1].question).toBe('LCP 从 3.4s 降到 2.1s 做了什么');
  });

  it('不把「复盘与改进」段落算进最后一题的答案', () => {
    const questions = parseInterviewGuideMarkdown(SAMPLE);
    expect(questions[1].answer).not.toContain('表现较好');
  });

  it('保留答案里的代码块', () => {
    const questions = parseInterviewGuideMarkdown(SAMPLE);
    expect(questions[1].answer).toContain('PerformanceObserver');
  });

  it('同一题干生成的 id 稳定，便于跨端保留收藏与掌握度', () => {
    const first = parseInterviewGuideMarkdown(SAMPLE);
    const second = parseInterviewGuideMarkdown(SAMPLE.replace('## 二、复盘与改进', '## 二、复盘'));
    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
  });

  it('没有题目时返回空数组', () => {
    expect(parseInterviewGuideMarkdown('# 标题\n\n随便写点东西')).toEqual([]);
  });
});

describe('summariseMastery', () => {
  const questions: InterviewQuestion[] = [
    { id: 'a', question: 'A', answer: '' },
    { id: 'b', question: 'B', answer: '' },
    { id: 'c', question: 'C', answer: '' },
  ];

  it('只把「熟练」及以上算作已掌握', () => {
    const summary = summariseMastery(questions, { a: 3, b: 1, c: 2 });
    expect(summary).toMatchObject({ total: 3, marked: 3, solid: 2, percent: 67 });
  });

  it('未标记的题不计入分子', () => {
    const summary = summariseMastery(questions, { a: 2 });
    expect(summary).toMatchObject({ total: 3, marked: 1, solid: 1, percent: 33 });
  });

  it('没有题目时百分比为 0，不出现 NaN', () => {
    expect(summariseMastery([], undefined).percent).toBe(0);
  });
});

describe('buildInterviewGuideMessages', () => {
  it('把公司、岗位、场次与简历一起注入，并要求沿用标题', () => {
    const messages = buildInterviewGuideMessages({
      company: '字节跳动',
      position: '前端开发工程师 - APM',
      sessionName: '技术一面',
      questions: '1. 自我介绍',
      resumeText: '## 实习经历\n- 性能监控',
      candidateContext: '候选人补充',
    });

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('加粗概括');
    const user = messages[1].content;
    expect(user).toContain('字节跳动 · 前端开发工程师 - APM · 技术一面');
    expect(user).toContain('性能监控');
    expect(user).toContain('自我介绍');
    expect(user).toContain('候选人补充');
  });

  it('简历为空时给出明确兜底提示，不编造经历', () => {
    const messages = buildInterviewGuideMessages({
      company: '公司',
      position: '岗位',
      sessionName: '一面',
      questions: '问题',
      resumeText: '',
    });
    expect(messages[1].content).toContain('简历为空');
  });
});
