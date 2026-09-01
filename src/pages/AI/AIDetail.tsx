import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiProjects, getProjectCards } from '@/data/ai';
import { ArrowLeft, FileText, FileCode, X, Table } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { CardStatus } from '@/types';
import { useCardStore } from '@/store';
import { findFirstUnrememberedIndex } from '@/utils/cardStatus';
import { cn } from '@/utils/cn';

export function AIDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = aiProjects.find((p) => p.id === projectId);
  const cards = getProjectCards(projectId || '');

  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlIframeMounted, setHtmlIframeMounted] = useState(false);
  const [showXlsxModal, setShowXlsxModal] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [xlsxData, setXlsxData] = useState<Record<string, string | number | null>[]>([]);
  const [xlsxHeaders, setXlsxHeaders] = useState<string[]>([]);
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const xlsxLoadingRef = useRef(false);

  useEffect(() => {
    if (cards.length === 0) return;
    const { cardStatuses } = useCardStore.getState();
    setCurrentCardIndex(findFirstUnrememberedIndex(cards, cardStatuses));
  }, [projectId, cards.length]);

  const openHtmlModal = () => {
    setHtmlIframeMounted(true);
    setShowHtmlModal(true);
  };

  const loadXlsxData = async () => {
    if (!project?.files.xlsx || xlsxLoaded || xlsxLoadingRef.current) return;
    xlsxLoadingRef.current = true;
    try {
      const XLSX = await import('xlsx');
      const response = await fetch(project.files.xlsx);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as Array<
        Array<string | number | null>
      >;

      if (jsonData.length > 0) {
        const headers = (jsonData[0] as string[]).map(String);
        setXlsxHeaders(headers);
        const data = jsonData.slice(1).map((row) => {
          const obj: Record<string, string | number | null> = {};
          headers.forEach((header, i) => {
            obj[header] = row[i] ?? null;
          });
          return obj;
        });
        setXlsxData(data);
        setXlsxLoaded(true);
      }
    } catch (error) {
      console.error('Failed to load XLSX:', error);
    } finally {
      xlsxLoadingRef.current = false;
    }
  };

  const openXlsxModal = () => {
    setShowXlsxModal(true);
    void loadXlsxData();
  };

  const currentCard = cards[currentCardIndex];

  const handleStatusChange = (status: CardStatus) => {
    if (currentCard) {
      useCardStore.getState().updateCardStatus(currentCard.id, status);
    }
    if (currentCardIndex < cards.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex((prev) => Math.min(cards.length - 1, prev + 1));
      }, 300);
    }
  };

  const handleCardChange = (newIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(newIndex, cards.length - 1));
    setCurrentCardIndex(clampedIndex);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500">未找到该资讯项目</p>
          <button
            onClick={() => navigate('/ai')}
            className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            返回 AI 资讯首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-6 pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/ai')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/80 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} />
            返回
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {project.files.html && (
            <button
              onClick={openHtmlModal}
              className="flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <FileCode className="text-blue-600" size={24} />
              <span className="text-blue-700 font-medium">查看 HTML</span>
            </button>
          )}
          {project.files.xlsx && (
            <button
              onClick={openXlsxModal}
              className="flex items-center justify-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            >
              <Table className="text-green-600" size={24} />
              <span className="text-green-700 font-medium">查看数据</span>
            </button>
          )}
          {project.files.pdf && (
            <a
              href={project.files.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <FileText className="text-red-600" size={24} />
              <span className="text-red-700 font-medium">下载 PDF</span>
            </a>
          )}
        </div>

        {cards.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-[768px] max-w-full mb-4">
              <h3 className="text-lg font-semibold text-gray-900">知识卡片</h3>
            </div>

            <FlashCardComponent
              card={currentCard}
              onStatusChange={handleStatusChange}
              currentIndex={currentCardIndex}
              totalCards={cards.length}
              onJumpTo={handleCardChange}
              chapterCards={cards}
              showEdit={true}
            />

            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => handleCardChange(currentCardIndex - 1)}
                disabled={currentCardIndex === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一题
              </button>
              <button
                onClick={() => handleCardChange(currentCardIndex + 1)}
                disabled={currentCardIndex === cards.length - 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一题
              </button>
            </div>
          </div>
        )}

        {cards.length === 0 && (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">暂无知识卡片</p>
          </div>
        )}
      </div>

      {/* HTML iframe：首次打开后保持挂载，关闭仅隐藏外壳 */}
      {htmlIframeMounted && project.files.html && (
        <div
          className={cn(
            'fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4',
            !showHtmlModal && 'hidden'
          )}
          onClick={() => setShowHtmlModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              <button
                onClick={() => setShowHtmlModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <iframe src={project.files.html} className="flex-1 w-full" title={project.name} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {showXlsxModal && project.files.xlsx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowXlsxModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">数据统计</h3>
                <button
                  onClick={() => setShowXlsxModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                {!xlsxLoaded ? (
                  <p className="text-sm text-gray-500 text-center py-12">加载中…</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {xlsxHeaders.map((header) => (
                            <th key={header} className="px-4 py-2 text-left font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {xlsxData.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            {xlsxHeaders.map((header) => (
                              <td key={header} className="px-4 py-2 text-gray-600">
                                {row[header]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
