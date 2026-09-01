import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui';
import { AnswerImageViewer } from '@/components/Card/AnswerImageViewer';
import { FlashCard as FlashCardType } from '@/types';

const PREVIEW_IMAGE =
  'https://img.bomianfm.com/question-images/images/2026/05/01/203_1777607877656.png?eo-img.format=webp';
const PREVIEW_QUESTION = 'JavaScript 中 null 和 undefined 的区别';

const previewCard: FlashCardType = {
  id: 'preview-null-undefined',
  module: 'core',
  chapterId: 'javascript',
  category: 'JavaScript',
  question: PREVIEW_QUESTION,
  answer: '',
  tags: [],
  status: 'unvisited',
  difficulty: 'easy',
  answerImage: PREVIEW_IMAGE,
};

/**
 * 临时预览页 — PNG 图解 + 卡片内缩放 + 全屏查看
 */
export function CardImagePreview() {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e?: React.MouseEvent) => {
    if (e && (e.target as HTMLElement).closest('button, a, [data-stop-propagation]')) {
      return;
    }
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className="min-h-[calc(100dvh-8rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center max-w-2xl">
        <Badge variant="warning" className="mb-3">预览模式 · 暂未写入正式数据</Badge>
        <h1 className="text-2xl font-extrabold text-[#3c3c3c]">卡片背面 PNG 图解预览</h1>
        <p className="mt-2 text-sm text-[#777]">
          优先 PNG 格式 · 卡片内宽度自适应 · 点击图片全屏查看
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto min-w-0">
        <div
          className="relative cursor-pointer w-full h-[clamp(420px,calc(100dvh-11rem),640px)] lg:h-[clamp(480px,calc(100dvh-10rem),720px)]"
          style={{ perspective: '1000px' }}
          onClick={handleFlip}
        >
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute inset-0 flex flex-col bg-white rounded-2xl border-2 border-[#e5e5e5] border-b-4 border-b-[#d0d0d0] overflow-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="h-3 bg-[#58CC02]" />
              <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b-2 border-[#e5e5e5]">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{previewCard.category}</Badge>
                  <Badge variant="outline">预览 1 / 1</Badge>
                </div>
                <Badge variant="default">未开始</Badge>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 overflow-hidden">
                <div className="w-20 h-20 rounded-full bg-[#58CC02] border-b-4 border-[#46A302] flex items-center justify-center mb-6">
                  <HelpCircle size={40} className="text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#3c3c3c] text-center leading-relaxed">
                  {previewCard.question}
                </h2>
                <Badge variant="success" className="mt-4">简单</Badge>
              </div>
              <div className="px-4 py-2 bg-[#f7f7f7] text-center text-xs sm:text-sm font-bold text-[#777777] border-t-2 border-[#e5e5e5]">
                点击卡片查看答案
              </div>
            </div>

            <div
              className="absolute inset-0 flex flex-col bg-white rounded-2xl border-2 border-[#1CB0F6] border-b-4 border-b-[#1899D6] overflow-hidden"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="h-3 bg-[#1CB0F6]" />
              <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b-2 border-[#e5e5e5] bg-[#f0f9ff]">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{previewCard.category}</Badge>
                  <Badge variant="default">未开始</Badge>
                  <span className="text-xs font-bold text-[#1CB0F6]">图解 · 点击放大</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4" data-stop-propagation>
                <AnswerImageViewer src={PREVIEW_IMAGE} alt={PREVIEW_QUESTION} />
              </div>
              <div className="px-4 py-2 border-t-2 border-[#e5e5e5] bg-[#f7f7f7] text-center text-xs sm:text-sm font-bold text-[#777777]">
                点击卡片空白处返回问题
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
