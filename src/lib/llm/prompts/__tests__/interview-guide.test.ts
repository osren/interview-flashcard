import { describe, expect, it } from 'vitest';
import type { InterviewQuestion } from '@/types/interview';
import {
  appendQuestionsToMarkdown,
  buildInterviewGuideAppendMessages,
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

describe('appendQuestionsToMarkdown', () => {
  it('把新增题目插到问答区末尾、复盘之前', () => {
    const appended = `### 3. 为什么要做分层告警

**结论**：纯数值异常交给规则。

- **分层设计**：L1 规则、L2 语义。
`;
    const merged = appendQuestionsToMarkdown(SAMPLE, appended);

    expect(merged.indexOf('为什么要做分层告警')).toBeGreaterThan(merged.indexOf('privacyPopList'));
    expect(merged.indexOf('为什么要做分层告警')).toBeLessThan(merged.indexOf('## 二、复盘与改进'));
  });

  it('统一重排编号，原有题目内容不动', () => {
    const merged = appendQuestionsToMarkdown(SAMPLE, '### 7. 新题\n\n**结论**：x\n');

    expect(merged).toContain('### 1. 自我介绍');
    expect(merged).toContain('### 2. LCP 从 3.4s 降到 2.1s 做了什么');
    expect(merged).toContain('### 3. 新题');
    expect(merged).not.toContain('### 7. 新题');
  });

  it('丢弃模型多输出的一级/二级标题，不破坏既有结构', () => {
    const merged = appendQuestionsToMarkdown(
      SAMPLE,
      '# 字节跳动 · 前端开发工程师 - APM · 技术一面\n\n## 一、面试问答\n\n### 1. 新题\n\n**结论**：x\n'
    );

    expect(merged.match(/^# /gm)).toHaveLength(1);
    expect(merged.match(/^## /gm)).toHaveLength(2);
  });

  it('没有题目块时原样返回，不写入无关文字', () => {
    expect(appendQuestionsToMarkdown(SAMPLE, '这里是无关说明')).toBe(SAMPLE);
  });

  it('追加后能被重新解析，新题进入题目清单', () => {
    const merged = appendQuestionsToMarkdown(SAMPLE, '### 3. 新题\n\n**结论**：x\n');
    const questions = parseInterviewGuideMarkdown(merged);

    expect(questions).toHaveLength(3);
    expect(questions[2].question).toBe('新题');
    expect(questions[2].id).toMatch(/^q-/);
  });

  it('代码块内的三级标题不参与重排', () => {
    const doc = `# 标题

## 一、面试问答

### 1. 旧题

\`\`\`md
### 9. 这是示例文本
\`\`\`
`;
    const merged = appendQuestionsToMarkdown(doc, '### 2. 新题\n\n**结论**：x\n');

    expect(merged).toContain('### 9. 这是示例文本');
    expect(merged).toContain('### 2. 新题');
  });
});

describe('追问结构', () => {
  it('四级标题的追问并入上一题答案，不单独成题', () => {
    const doc = `# 标题

## 一、面试问答

### 1. 项目难点是什么

**结论**：告警降噪的召回与成本平衡。

#### 追问：告警是业务告警还是外网告警

**结论**：两类都有，外网告警占比更高。

### 2. 浏览器缓存有哪些

**结论**：强缓存与协商缓存。
`;
    const questions = parseInterviewGuideMarkdown(doc);

    expect(questions).toHaveLength(2);
    expect(questions[0].question).toBe('项目难点是什么');
    expect(questions[0].answer).toContain('追问：告警是业务告警还是外网告警');
    expect(questions[1].question).toBe('浏览器缓存有哪些');
  });

  it('追加时追问跟着所属题目一起写入，不参与 ### 编号重排', () => {
    const merged = appendQuestionsToMarkdown(
      SAMPLE,
      '### 3. 新题\n\n**结论**：x\n\n#### 追问：这条追问属于新题\n\n**结论**：y\n'
    );

    expect(merged).toContain('### 3. 新题');
    expect(merged).toContain('#### 追问：这条追问属于新题');
    expect(merged.match(/^#### /gm)).toHaveLength(1);
  });

  it('生成与追加的提示词都要求追问用四级标题', () => {
    const generated = buildInterviewGuideMessages({
      company: '公司',
      position: '岗位',
      sessionName: '一面',
      questions: '1. 项目难点\n追问：告警是业务还是外网',
      resumeText: '简历',
    });
    const appended = buildInterviewGuideAppendMessages({
      company: '公司',
      position: '岗位',
      sessionName: '一面',
      existingQuestions: ['项目难点'],
      newQuestions: '追问：告警是业务还是外网',
      resumeText: '简历',
      startIndex: 2,
    });

    expect(generated[0].content).toContain('#### 追问：');
    expect(appended[0].content).toContain('#### 追问：');
    expect(appended[0].content).toContain('给追问单独的 `###` 编号');
  });
});

describe('buildInterviewGuideAppendMessages', () => {
  it('编号从已有题数继续，并列出已有题干防重复', () => {
    const messages = buildInterviewGuideAppendMessages({
      company: '字节跳动',
      position: '前端开发工程师 - APM',
      sessionName: '技术一面',
      existingQuestions: ['自我介绍', 'LCP 优化'],
      newQuestions: '分层告警怎么设计',
      resumeText: '简历正文',
      startIndex: 3,
    });

    expect(messages[0].content).toContain('只输出新增题目的问答片段');
    expect(messages[0].content).toContain('编号从 3 开始');

    const user = messages[1].content;
    expect(user).toContain('1. 自我介绍');
    expect(user).toContain('2. LCP 优化');
    expect(user).toContain('分层告警怎么设计');
    expect(user).toContain('简历正文');
  });
});
