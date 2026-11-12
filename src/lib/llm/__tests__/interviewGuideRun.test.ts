import { describe, expect, it } from 'vitest';
import { splitQuestionsIntoBatches } from '../interviewGuideRun';

const LONG_LIST = `自我介绍
项目里面做得比较好的项目是什么？开发过程中遇到的难点是什么？解决思路是什么？解决完之后的收益是什么？
追问：这个告警项目每条告警主要是什么告警，是业务还是外网？
追问：接口告警需要用到大模型吗？
你想往大前端开发走的话，客户端和 Web 的一些交互，你大概了解度多少？
WebView 打开 H5 分为哪些步骤？浏览器怎么渲染 HTML？
追问：这个过程中 HTML 的结构是怎样的？
HTML 的解析过程中，CSS 树和 DOM 树有阻塞关系吗？
async 和 defer 阻塞渲染吗？
为什么 CSS 会阻塞 JS？
JS 怎么形成闭包的？
追问：函数怎么被外部持有的？
浏览器缓存有哪些，什么特点？
追问：分别用在什么场景？
强缓存和协商缓存的标识
讲讲浏览器的安全策略
追问：XSS 的具体场景
CSRF 攻击
追问：SameSite Cookie 做了什么事情？`;

describe('splitQuestionsIntoBatches', () => {
  it('短清单只切一批', () => {
    expect(splitQuestionsIntoBatches('自我介绍\n项目难点')).toHaveLength(1);
  });

  it('长清单切成多批', () => {
    const batches = splitQuestionsIntoBatches(LONG_LIST, { maxGroups: 3, maxChars: 900 });
    expect(batches.length).toBeGreaterThan(1);
  });

  it('追问不会被拆到下一批开头', () => {
    const batches = splitQuestionsIntoBatches(LONG_LIST, { maxGroups: 3, maxChars: 900 });
    for (const batch of batches) {
      expect(batch.split('\n')[0]).not.toMatch(/^追问/);
    }
  });

  it('追问留在所属主问题所在的批里', () => {
    const batches = splitQuestionsIntoBatches(LONG_LIST, { maxGroups: 3, maxChars: 900 });
    expect(batches[0]).toContain('项目里面做得比较好的项目是什么');
    expect(batches[0]).toContain('追问：这个告警项目每条告警主要是什么告警');
  });

  it('默认参数下同一份清单切出的批数更少（批次调大）', () => {
    const withOldDefaults = splitQuestionsIntoBatches(LONG_LIST, { maxGroups: 4, maxChars: 900 });
    const withNewDefaults = splitQuestionsIntoBatches(LONG_LIST);
    expect(withNewDefaults.length).toBeLessThan(withOldDefaults.length);
  });

  it('所有主问题都被覆盖，不丢行', () => {
    const batches = splitQuestionsIntoBatches(LONG_LIST, { maxGroups: 3, maxChars: 900 });
    const joined = batches.join('\n');
    for (const line of LONG_LIST.split('\n')) {
      if (line.trim()) expect(joined).toContain(line.trim());
    }
  });
});
