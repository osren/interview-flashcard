import { LazyMDMarkdown } from '@/components/ui/LazyMDEditor';

interface StreamMarkdownProps {
  content: string;
  streaming?: boolean;
}

export function StreamMarkdown({ content, streaming = false }: StreamMarkdownProps) {
  if (!content && streaming) {
    return <p className="text-sm font-bold text-[#777777]">正在生成...</p>;
  }

  if (!content) {
    return <p className="text-sm text-[#afafaf]">点击卡片上的 AI 按钮开始。</p>;
  }

  return (
    <div className="prose prose-sm max-w-none" data-color-mode="light">
      <LazyMDMarkdown
        source={content}
        style={{ backgroundColor: 'transparent', color: '#3c3c3c' }}
      />
      {streaming && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-[#1CB0F6] animate-pulse align-middle" />
      )}
    </div>
  );
}
