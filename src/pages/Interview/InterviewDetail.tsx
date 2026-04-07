import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewStore } from '@/store/useInterviewStore';
import { ArrowLeft, Plus, Edit3, Save, X, ChevronLeft, ChevronRight, Clock, Check, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';
import { ImportExportModal } from '@/components/ImportExportModal';

export function InterviewDetail() {
  const navigate = useNavigate();
  const { companyId, departmentId, sessionId } = useParams();

  // 订阅 companies 状态变化以响应 store 更新
  useInterviewStore((state) => state.companies);

  const {
    getCompany,
    getDepartment,
    getSession,
    addQuestion,
    updateQuestion,
    updateSessionDate,
    updateSessionName,
    updateSessionStatus,
  } = useInterviewStore();

  const company = getCompany(companyId || '');
  const department = getDepartment(companyId || '', departmentId || '');
  const session = getSession(companyId || '', departmentId || '', sessionId || '');

  // UI 状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '' });
  const [editQuestion, setEditQuestion] = useState({ question: '', answer: '' });

  const questions = session?.questions || [];

  // 切换问题时重置状态
  useEffect(() => {
    setIsFlipped(false);
    setIsEditing(false);
  }, [currentIndex]);

  // 跳转到指定题号
  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowQuestionList(false);
  };

  const handleFlip = () => {
    if (!isEditing) {
      setIsFlipped((prev) => !prev);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.question.trim() && companyId && departmentId && sessionId) {
      addQuestion(companyId, departmentId, sessionId, newQuestion.question, newQuestion.answer);
      setNewQuestion({ question: '', answer: '' });
      setIsAdding(false);
      setCurrentIndex(questions.length);
    }
  };

  const handleUpdateQuestion = (questionId: string) => {
    if (editQuestion.question.trim() && companyId && departmentId && sessionId) {
      updateQuestion(companyId, departmentId, sessionId, questionId, editQuestion.question, editQuestion.answer);
      setIsEditing(false);
      setEditQuestion({ question: '', answer: '' });
    }
  };

  const handleDateChange = (date: string) => {
    if (companyId && departmentId && sessionId) {
      updateSessionDate(companyId, departmentId, sessionId, date);
    }
  };

  const handleNameChange = (name: string) => {
    if (companyId && departmentId && sessionId) {
      updateSessionName(companyId, departmentId, sessionId, name);
    }
  };

  const handleStatusChange = (newStatus: 'waiting' | 'passed' | 'failed') => {
    if (companyId && departmentId && sessionId) {
      updateSessionStatus(companyId, departmentId, sessionId, newStatus);
    }
  };

  if (!company || !department || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500">未找到该面试记录</p>
          <button
            onClick={() => navigate('/interview')}
            className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            返回面经首页
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const statusConfig = {
    waiting: { label: '等待', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Clock },
    passed: { label: '通过', color: 'text-green-600 bg-green-50 border-green-200', icon: Check },
    failed: { label: '失败', color: 'text-red-600 bg-red-50 border-red-200', icon: X },
  };

  const StatusIcon = statusConfig[session.status].icon;

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
            onClick={() => navigate('/interview')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/80 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} />
            返回
          </button>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={session.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="px-3 py-1.5 bg-white/80 rounded-lg border border-gray-200 text-sm outline-none"
              placeholder="场次名称"
            />
            <input
              type="date"
              value={session.date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-1.5 bg-white/80 rounded-lg border border-gray-200 text-sm outline-none"
            />
            <button
              onClick={() => {
                const statusMap: Record<string, 'waiting' | 'passed' | 'failed'> = {
                  waiting: 'passed',
                  passed: 'failed',
                  failed: 'waiting'
                };
                const nextStatus = statusMap[session.status] || 'waiting';
                handleStatusChange(nextStatus);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig[session.status].color}`}
            >
              <StatusIcon size={12} />
              {statusConfig[session.status].label}
            </button>
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {company.name} - {department.name} - {session.name}
          </h1>
          <p className="text-gray-500">{session.date} · {questions.length} 道问题</p>
        </div>

        {/* 卡片区域 */}
        {questions.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* 翻转卡片 */}
            <div
              className="w-[768px] max-w-[768px] cursor-pointer"
              style={{ height: '480px', perspective: '1000px' }}
              onClick={handleFlip}
            >
              <motion.div
                className="absolute inset-0 w-full h-full"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* 正面 - 问题 */}
                <div
                  className="absolute inset-0 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        问题
                      </span>
                      <span className="text-gray-400 text-sm">
                        {currentIndex + 1} / {questions.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 overflow-hidden">
                    <div className="text-5xl mb-4">❓</div>
                    <h2 className="text-lg font-medium text-gray-800 text-center whitespace-pre-wrap leading-relaxed">
                      {currentQuestion.question}
                    </h2>
                  </div>

                  <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
                    点击卡片查看答案
                  </div>
                </div>

                {/* 背面 - 答案 */}
                <div
                  className="absolute inset-0 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-indigo-200 overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        回答
                      </span>
                    </div>
                    <div className="flex items-center gap-2" data-stop-propagation>
                      {isEditing ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUpdateQuestion(currentQuestion.id); }}
                            className="p-1.5 text-gray-600 hover:bg-green-100 hover:text-green-700 rounded transition-colors"
                            title="保存"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                            className="p-1.5 text-gray-600 hover:bg-red-100 hover:text-red-700 rounded transition-colors"
                            title="取消"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                            setEditQuestion({ question: currentQuestion.question, answer: currentQuestion.answer });
                          }}
                          className="p-1.5 text-gray-500 hover:bg-indigo-100 hover:text-indigo-700 rounded transition-colors"
                          title="编辑"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 px-6 py-4 overflow-y-auto" data-color-mode="light">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editQuestion.question}
                          onChange={(e) => setEditQuestion({ ...editQuestion, question: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                          placeholder="问题"
                        />
                        <MDEditor
                          value={editQuestion.answer}
                          onChange={(val) => setEditQuestion({ ...editQuestion, answer: val || '' })}
                          height={250}
                          preview="edit"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-700">
                        <MDEditor.Markdown
                          source={currentQuestion.answer || '暂无回答'}
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-3 bg-indigo-100/50 text-center text-sm text-gray-500 border-t border-indigo-200">
                    再次点击卡片可返回问题
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 导航按钮 */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
                上一题
              </button>
              <button
                onClick={() => {
                  setIsAdding(true);
                  setIsFlipped(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                新增问题
              </button>
              <button
                onClick={() => setShowQuestionList(!showQuestionList)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors shadow-sm ${
                  showQuestionList ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <List size={18} />
                题号
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                下一题
                <ChevronRight size={18} />
              </button>
            </div>

            {/* 题号列表弹窗 */}
            <AnimatePresence>
              {showQuestionList && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10"
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          index === currentIndex
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* 空状态 */
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">暂无问题</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">点击下方按钮添加第一个问题</p>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus size={18} />
              新增问题
            </button>
          </div>
        )}

        {/* 新增问题弹窗 */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setIsAdding(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">新增问题</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">问题</label>
                    <input
                      type="text"
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                      placeholder="输入面试问题"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">回答</label>
                    <MDEditor
                      value={newQuestion.answer}
                      onChange={(val) => setNewQuestion({ ...newQuestion, answer: val || '' })}
                      height={200}
                      preview="edit"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewQuestion({ question: '', answer: '' });
                    }}
                    className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    disabled={!newQuestion.question.trim()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 导入导出弹窗 */}
      <ImportExportModal
        interviewQuestions={questions}
        companyId={companyId}
        departmentId={departmentId}
        sessionId={sessionId}
        title={`${company?.name || ''} - ${department?.name || ''} - ${session?.name || ''}`}
      />
    </div>
  );
}
