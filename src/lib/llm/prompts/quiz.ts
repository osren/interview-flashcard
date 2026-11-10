import type { FlashCard } from '@/types';
import type { ChatMessage } from '../types';
import { extractJsonFromLlm } from './parse-jd';

/** 单张卡片送进模型时的答案上限，避免一次请求过长 */
const MAX_ANSWER_CHARS = 1200;
/** 一次最多出几道题，控制单次请求的 token */
export const MAX_CARDS_PER_REQUEST = 6;

const QUIZ_SYSTEM_PROMPT = `你是面试题库的出题老师。把给定的「面试问答卡片」改写成一道单选题，用来检验读者是否真的理解了这个知识点。

出题规则：
1. 先在心里确定这张卡片的「考点」（一句话，例如「React 中 useMemo 的依赖比较是浅比较」），再据此出题。题干要自足，读者不看原卡片也能答。
2. 只考卡片答案里的核心结论或关键因果，不要考版本号、人名、无关细节，也不要照抄答案当题干。
3. 一共 4 个选项，有且只有一个正确。正确项是答案里的结论改写，不能逐字照抄原答案（否则读者靠关键词匹配就能选对）。
4. 3 个干扰项必须是「同领域里常见但错误的说法」，例如把两个概念搞混、把因果倒置、把条件说反。禁止出现明显荒谬、长度异常、或「以上都对/都不对」这类选项。
5. 4 个选项长度尽量接近（每条 8~30 字），互斥、不重叠、不能有两个说法都成立。
6. explanation 用 1~2 句话说明正确项为什么对、最容易被误选的那一项错在哪。
7. distractors 要给**每一个错误选项**各写一条「误解诊断」：选了这个选项的人，脑子里具体把什么和什么搞混了。必须写成「把 X 当成 Y」「把因果说反了」「漏掉了某个条件」这种可指认的错误，不要写「这个说法不正确」「不符合题意」这类空话。
8. 答案里如果有大段代码，不要把它做成选项，只考代码背后的原理。
9. 全部用中文。输出严格的 JSON，不要 Markdown、不要解释性前后缀。

输出结构：
{
  "items": [
    {
      "cardId": "原样返回传入的卡片 id",
      "point": "考点，一句话",
      "stem": "题干",
      "options": ["选项1", "选项2", "选项3", "选项4"],
      "answerIndex": 0,
      "explanation": "解析",
      "distractors": [
        { "optionIndex": 1, "misconception": "误解诊断", "correction": "怎么区分" }
      ]
    }
  ]
}`;

function clipAnswer(answer: string): string {
  const plain = answer
    .replace(/```[\s\S]*?```/g, (block) => block.slice(0, 200))
    .replace(/\r\n/g, '\n')
    .trim();
  return plain.length > MAX_ANSWER_CHARS ? `${plain.slice(0, MAX_ANSWER_CHARS)}…` : plain;
}

export function buildQuizMessages(cards: FlashCard[]): ChatMessage[] {
  const payload = cards.map((card) => ({
    cardId: card.id,
    chapter: card.chapterId,
    question: card.question,
    answer: clipAnswer(card.answer),
  }));

  const userPrompt = [
    `请为下面 ${payload.length} 张卡片各出一道单选题，按 cardId 一一对应返回。`,
    JSON.stringify(payload, null, 2),
  ].join('\n\n');

  return [
    { role: 'system', content: QUIZ_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];
}

export function parseQuizPayload(content: string): unknown {
  return extractJsonFromLlm(content);
}
