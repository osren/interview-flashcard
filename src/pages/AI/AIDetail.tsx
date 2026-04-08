import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiProjects, getProjectCards } from '@/data/ai';
import { ArrowLeft, FileText, FileCode, X, Table } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { FlashCard as FlashCardComponent } from '@/components/Card';
import { CardStatus } from '@/types';

export function AIDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = aiProjects.find(p => p.id === projectId);
  const cards = getProjectCards(projectId || '');

  // 状态
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [showXlsxModal, setShowXlsxModal] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [jumpInput, setJumpInput] = useState('');
  const [xlsxData, setXlsxData] = useState<any[]>([]);
  const [xlsxHeaders, setXlsxHeaders] = useState<string[]>([]);

  // 加载 XLSX 数据
  useEffect(() => {
    if (project?.files.xlsx) {
      loadXlsxData();
    }
  }, [project]);

  // 防抖题号跳转
  useEffect(() => {
    if (!jumpInput) return;
    const timer = setTimeout(() => {
      const num = parseInt(jumpInput);
      if (num >= 1 && num <= cards.length) {
        handleCardChange(num - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [jumpInput]);

  const loadXlsxData = async () => {
    try {
      const response = await fetch(project!.files.xlsx!);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      if (jsonData.length > 0) {
        setXlsxHeaders(jsonData[0] as string[]);
        const headers = jsonData[0] as string[];
        const data = jsonData.slice(1).map(row => {
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        });
        setXlsxData(data);
      }
    } catch (error) {
      console.error('Failed to load XLSX:', error);
    }
  };

  const currentCard = cards[currentCardIndex];

  const handleStatusChange = (_status: CardStatus) => {
    // AI模块暂时不需要状态管理，自动下一张
    if (currentCardIndex < cards.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex(prev => Math.min(cards.length - 1, prev + 1));
      }, 300);
    }
  };

  const handleCardChange = (newIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(newIndex, cards.length - 1));
    setCurrentCardIndex(clampedIndex);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        {/* 头部 */}
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

        {/* 文件区域 - 改为查看按钮 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {project.files.html && (
            <button
              onClick={() => setShowHtmlModal(true)}
              className="flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <FileCode className="text-blue-600" size={24} />
              <span className="text-blue-700 font-medium">查看 HTML</span>
            </button>
          )}
          {project.files.xlsx && (
            <button
              onClick={() => setShowXlsxModal(true)}
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

        {/* 知识卡片区域 */}
        {cards.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-[768px] max-w-full mb-4">
              <h3 className="text-lg font-semibold text-gray-900">知识卡片</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={cards.length}
                  value={jumpInput || currentCardIndex + 1}
                  onChange={(e) => {
                    setJumpInput(e.target.value);
                  }}
                  onBlur={() => {
                    if (jumpInput) {
                      const num = parseInt(jumpInput);
                      if (num >= 1 && num <= cards.length) {
                        handleCardChange(num - 1);
                      }
                    }
                    setJumpInput('');
                  }}
                  className="w-14 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-gray-400 text-sm">/ {cards.length}</span>
              </div>
            </div>

            {/* 使用统一的 FlashCard 组件 */}
            <FlashCardComponent
              card={currentCard}
              onStatusChange={handleStatusChange}
              currentIndex={currentCardIndex}
              totalCards={cards.length}
              showEdit={true}
            />

            {/* 导航按钮 */}
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

        {/* 空卡片状态 */}
        {cards.length === 0 && (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">暂无知识卡片</p>
          </div>
        )}
      </div>

      {/* HTML 弹窗 */}
      <AnimatePresence>
        {showHtmlModal && project.files.html && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowHtmlModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
              <iframe
                src={project.files.html}
                className="flex-1 w-full"
                title={project.name}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XLSX 弹窗 */}
      <AnimatePresence>
        {showXlsxModal && project.files.xlsx && xlsxData.length > 0 && (
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        {xlsxHeaders.map(header => (
                          <th key={header} className="px-4 py-2 text-left font-medium text-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {xlsxData.map((row, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          {xlsxHeaders.map(header => (
                            <td key={header} className="px-4 py-2 text-gray-600">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}