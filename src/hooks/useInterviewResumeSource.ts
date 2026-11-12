import { useEffect, useMemo, useRef, useState } from 'react';
import { useInterviewStore } from '@/store/useInterviewStore';
import { useResumeStore } from '@/store/useResumeStore';
import { extractPdfText } from '@/utils/extractPdfText';

export interface InterviewResumeOption {
  /** 'pdf:<id>' 或 'markdown:<id>' */
  key: string;
  kind: 'pdf' | 'markdown';
  id: string;
  label: string;
  meta: string;
  /** 实际注入模型的正文 */
  text: string;
  /** 没有可注入正文（PDF 无文字层或 Markdown 为空） */
  disabled: boolean;
}

export type InterviewResumeStatus = 'ready' | 'extracting' | 'empty' | 'pending';

function formatUploadDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

/**
 * 生成面经 / 追加问题共用的简历来源选择。
 * 口径与简历模块的 defaultSource 一致：先按上传时间倒序列出 PDF，再列出 Markdown 简历，
 * 默认取最新上传的 PDF；PDF 缺文字时选中后补一次提取，避免设计稿导出（无文字层）反复重试。
 */
export function useInterviewResumeSource({ active }: { active: boolean }) {
  const resumes = useResumeStore((state) => state.resumes);
  const markdownResumes = useResumeStore((state) => state.markdownResumes);
  const primaryResumeId = useResumeStore((state) => state.primaryResumeId);
  const updateResumeExtractedText = useResumeStore((state) => state.updateResumeExtractedText);
  const aiResumeSource = useInterviewStore((state) => state.aiResumeSource);
  const setAiResumeSource = useInterviewStore((state) => state.setAiResumeSource);

  const [resumeKey, setResumeKey] = useState('');
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const attemptedExtractRef = useRef<Set<string>>(new Set());

  const pdfOptions = useMemo<InterviewResumeOption[]>(
    () =>
      [...resumes]
        .sort((a, b) => b.uploadTime - a.uploadTime)
        .map((item) => {
          const text = item.extractedText ?? '';
          return {
            key: `pdf:${item.id}`,
            kind: 'pdf' as const,
            id: item.id,
            label: `${item.name}.pdf`,
            meta: `${formatUploadDate(item.uploadTime)} · PDF`,
            text,
            disabled: !text.trim(),
          };
        }),
    [resumes]
  );

  const markdownOptions = useMemo<InterviewResumeOption[]>(
    () =>
      markdownResumes.map((item) => {
        const text = item.content ?? '';
        return {
          key: `markdown:${item.id}`,
          kind: 'markdown' as const,
          id: item.id,
          label: item.id === primaryResumeId ? `${item.title}（主简历）` : item.title,
          meta: 'Markdown',
          text,
          disabled: !text.trim(),
        };
      }),
    [markdownResumes, primaryResumeId]
  );

  const resumeOptions = useMemo(
    () => [...pdfOptions, ...markdownOptions],
    [pdfOptions, markdownOptions]
  );

  const defaultResumeKey = useMemo(() => {
    if (aiResumeSource) {
      const key = `${aiResumeSource.kind}:${aiResumeSource.id}`;
      if (resumeOptions.some((option) => option.key === key && !option.disabled)) return key;
    }
    // 优先最新的 PDF，即便暂时没文字（选中后会补一次提取）
    if (pdfOptions[0]) return pdfOptions[0].key;
    const markdown = markdownOptions.find((option) => !option.disabled);
    return markdown?.key ?? resumeOptions[0]?.key ?? '';
  }, [aiResumeSource, resumeOptions, pdfOptions, markdownOptions]);

  useEffect(() => {
    if (active) setResumeKey(defaultResumeKey);
  }, [active, defaultResumeKey]);

  const selectedResume = resumeOptions.find((option) => option.key === resumeKey);
  const selectedPdf = useMemo(
    () => (selectedResume?.kind === 'pdf' ? resumes.find((item) => item.id === selectedResume.id) : undefined),
    [selectedResume, resumes]
  );

  useEffect(() => {
    if (!active || !selectedPdf) return;
    if (selectedPdf.extractedText?.trim()) return;
    if (attemptedExtractRef.current.has(selectedPdf.id)) return;

    let cancelled = false;
    setExtractingId(selectedPdf.id);
    void extractPdfText(selectedPdf.data)
      .then((text) => {
        if (cancelled) return;
        if (text.trim()) updateResumeExtractedText(selectedPdf.id, text);
        else attemptedExtractRef.current.add(selectedPdf.id);
      })
      .catch(() => {
        if (!cancelled) attemptedExtractRef.current.add(selectedPdf.id);
      })
      .finally(() => {
        if (!cancelled) setExtractingId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [active, selectedPdf, updateResumeExtractedText]);

  const selectedStatus: InterviewResumeStatus = !selectedResume
    ? 'empty'
    : selectedResume.text.trim()
      ? 'ready'
      : selectedResume.kind === 'markdown'
        ? 'empty'
        : extractingId === selectedPdf?.id
          ? 'extracting'
          : attemptedExtractRef.current.has(selectedPdf?.id ?? '')
            ? 'empty'
            : 'pending';

  const fallbackMarkdown = markdownOptions.find((option) => !option.disabled);

  const choose = (key: string) => {
    setResumeKey(key);
    const option = resumeOptions.find((item) => item.key === key);
    if (option) setAiResumeSource({ kind: option.kind, id: option.id });
  };

  return {
    pdfOptions,
    markdownOptions,
    resumeOptions,
    resumeKey,
    choose,
    selectedResume,
    selectedStatus,
    fallbackMarkdown,
  };
}
