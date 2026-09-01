import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X } from 'lucide-react';

/** 全屏预览设计稿比例（UI 约定，不需写入数据库） */
const FULLSCREEN_ASPECT_W = 1316;
const FULLSCREEN_ASPECT_H = 740;

/**
 * 答案图解查看器
 *
 * 数据层只需存 answerImage: string（URL），其余均为前端展示逻辑：
 * | 场景     | 行为                                      |
 * |----------|-------------------------------------------|
 * | 卡片背面 | w-full 自适应宽度，保持原图比例           |
 * | 全屏     | createPortal → body，1316×740 适配视口  |
 * | 遮罩     | bg-black/80 + backdrop-blur，点击关闭   |
 */

interface AnswerImageViewerProps {
  /** 图片 URL，建议 PNG 格式以保证文字类图解清晰度 */
  src: string;
  alt: string;
  className?: string;
}

function getFormatLabel(src: string): string {
  const pathname = src.split('?')[0];
  return pathname.split('.').pop()?.toUpperCase() ?? 'IMG';
}

/**
 * 卡片答案图解：卡片内宽度自适应缩放；
 * 全屏适配浏览器宽度，按 1316×740 比例缩放，背景遮罩 + 点击关闭。
 */
export function AnswerImageViewer({ src, alt, className }: AnswerImageViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);

  const open = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreen(true);
  }, []);

  const close = useCallback(() => {
    setFullscreen(false);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [fullscreen, close]);

  const formatLabel = getFormatLabel(src);

  const fullscreenOverlay = (
    <AnimatePresence>
      {fullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]"
          role="dialog"
          aria-modal="true"
          aria-label="全屏查看原图"
        >
          <button
            type="button"
            className="absolute inset-0 w-full h-full bg-black/80 backdrop-blur-sm cursor-zoom-out"
            onClick={close}
            aria-label="关闭预览"
          />

          <button
            type="button"
            onClick={close}
            className="fixed top-4 right-4 z-[10001] p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors border border-white/20"
            aria-label="关闭"
          >
            <X size={24} />
          </button>

          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <img
              src={src}
              alt={alt}
              className="block w-full h-auto max-h-[calc(100vh-5rem)] object-contain select-none pointer-events-auto"
              style={{
                aspectRatio: `${FULLSCREEN_ASPECT_W} / ${FULLSCREEN_ASPECT_H}`,
                maxWidth: `min(calc(100vw - 2rem), calc((100vh - 5rem) * ${FULLSCREEN_ASPECT_W} / ${FULLSCREEN_ASPECT_H}))`,
              }}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <p className="fixed bottom-4 left-0 right-0 z-[10001] text-center text-xs text-white/60 pointer-events-none">
            {FULLSCREEN_ASPECT_W} × {FULLSCREEN_ASPECT_H} 比例 · 适配浏览器宽度 · {formatLabel} · 点击遮罩关闭 · Esc 关闭
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        className={`relative w-full group cursor-zoom-in ${className ?? ''}`}
        onClick={open}
        data-stop-propagation
        aria-label="全屏查看原图"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto rounded-xl border border-[#e5e5e5] shadow-sm transition-shadow group-hover:shadow-md"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={12} />
          全屏查看
        </span>
      </button>

      {createPortal(fullscreenOverlay, document.body)}
    </>
  );
}
