import { useState } from 'react';
import { useInterviewStore, COMPANY_COLOR_OPTIONS } from '@/store/useInterviewStore';
import { InterviewStatus } from '@/types/interview';
import { Plus, ChevronDown, ChevronRight, X, Check, Clock, Calendar, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  waiting: { label: '等待', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Clock },
  passed: { label: '通过', color: 'text-green-600 bg-green-50 border-green-200', icon: Check },
  failed: { label: '失败', color: 'text-red-600 bg-red-50 border-red-200', icon: X },
};

const COMPANY_COLOR_MAP: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  yellow: 'from-yellow-500 to-yellow-600',
  purple: 'from-purple-500 to-purple-600',
  red: 'from-red-500 to-red-600',
  pink: 'from-pink-500 to-pink-600',
  cyan: 'from-cyan-500 to-cyan-600',
  gray: 'from-gray-500 to-gray-600',
};

const DEPARTMENT_COLOR_MAP: Record<string, string> = {
  blue: 'from-blue-400 to-blue-500',
  green: 'from-green-400 to-green-500',
  orange: 'from-orange-400 to-orange-500',
  yellow: 'from-yellow-400 to-yellow-500',
  purple: 'from-purple-400 to-purple-500',
  red: 'from-red-400 to-red-500',
  pink: 'from-pink-400 to-pink-500',
  cyan: 'from-cyan-400 to-cyan-500',
  gray: 'from-gray-400 to-gray-500',
};

export function InterviewIndex() {
  const navigate = useNavigate();
  const {
    companies,
    lastVisitedCompany,
    lastVisitedDepartment,
    addCompany,
    removeCompany,
    updateCompany,
    addDepartment,
    removeDepartment,
    updateDepartment,
    addSession,
    removeSession,
    updateSessionName,
    updateSessionDate,
    updateSessionStatus,
    setLastVisited,
  } = useInterviewStore();

  // 展开状态
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (lastVisitedCompany) initial.add(lastVisitedCompany);
    return initial;
  });
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (lastVisitedDepartment) initial.add(lastVisitedDepartment);
    return initial;
  });

  // 编辑状态 - 公司
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyColor, setNewCompanyColor] = useState('blue');
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanyColor, setEditCompanyColor] = useState('');

  // 编辑状态 - 部门
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [addingDeptToCompany, setAddingDeptToCompany] = useState<string | null>(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editDepartmentName, setEditDepartmentName] = useState('');

  // 场次
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [addingSessionToDept, setAddingSessionToDept] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionName, setEditSessionName] = useState('');
  const [editSessionDate, setEditSessionDate] = useState('');

  const toggleCompany = (companyId: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  };

  const toggleDepartment = (departmentId: string) => {
    setExpandedDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(departmentId)) {
        next.delete(departmentId);
      } else {
        next.add(departmentId);
      }
      return next;
    });
  };

  const handleStatusChange = (
    e: React.MouseEvent,
    companyId: string,
    departmentId: string,
    sessionId: string,
    currentStatus: InterviewStatus
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const statusMap: Record<InterviewStatus, InterviewStatus> = {
      waiting: 'passed',
      passed: 'failed',
      failed: 'waiting',
    };
    updateSessionStatus(companyId, departmentId, sessionId, statusMap[currentStatus]);
  };

  const handleSessionClick = (
    companyId: string,
    departmentId: string,
    sessionId: string
  ) => {
    setLastVisited(companyId, departmentId, sessionId);
    navigate(`/interview/${companyId}/${departmentId}/${sessionId}`);
  };

  // 公司操作
  const handleAddCompany = () => {
    if (newCompanyName.trim()) {
      addCompany(newCompanyName.trim(), newCompanyColor);
      setNewCompanyName('');
      setNewCompanyColor('blue');
      setIsAddingCompany(false);
    }
  };

  const handleEditCompany = (companyId: string, name: string, color: string) => {
    setEditingCompanyId(companyId);
    setEditCompanyName(name);
    setEditCompanyColor(color);
  };

  const handleSaveEditCompany = () => {
    if (editingCompanyId && editCompanyName.trim()) {
      updateCompany(editingCompanyId, editCompanyName.trim(), editCompanyColor);
      setEditingCompanyId(null);
      setEditCompanyName('');
      setEditCompanyColor('');
    }
  };

  const handleDeleteCompany = (companyId: string, companyName: string) => {
    if (confirm(`确定删除公司"${companyName}"吗？所有部门和新次都将被删除。`)) {
      removeCompany(companyId);
      setExpandedCompanies((prev) => {
        const next = new Set(prev);
        next.delete(companyId);
        return next;
      });
    }
  };

  // 部门操作
  const handleAddDepartment = (companyId: string) => {
    if (newDepartmentName.trim()) {
      addDepartment(companyId, newDepartmentName.trim());
      setNewDepartmentName('');
      setAddingDeptToCompany(null);
    }
  };

  const handleSaveEditDepartment = (companyId: string) => {
    if (editingDepartmentId && editDepartmentName.trim()) {
      updateDepartment(companyId, editingDepartmentId, editDepartmentName.trim());
      setEditingDepartmentId(null);
      setEditDepartmentName('');
    }
  };

  const handleDeleteDepartment = (companyId: string, departmentId: string, departmentName: string) => {
    if (confirm(`确定删除部门"${departmentName}"吗？所有场次都将被删除。`)) {
      removeDepartment(companyId, departmentId);
      setExpandedDepartments((prev) => {
        const next = new Set(prev);
        next.delete(departmentId);
        return next;
      });
    }
  };

  // 场次操作
  const handleAddSession = (companyId: string, departmentId: string) => {
    const name = newSessionName.trim() || '一面';
    const date = newSessionDate || new Date().toISOString().split('T')[0];
    addSession(companyId, departmentId, name, date);
    setNewSessionName('');
    setNewSessionDate('');
    setAddingSessionToDept(null);
  };

  const handleEditSession = (sessionId: string, name: string, date: string) => {
    setEditingSessionId(sessionId);
    setEditSessionName(name);
    setEditSessionDate(date);
  };

  const handleSaveEditSession = (companyId: string, departmentId: string, sessionId: string) => {
    if (editSessionName.trim()) {
      updateSessionName(companyId, departmentId, sessionId, editSessionName.trim());
      updateSessionDate(companyId, departmentId, sessionId, editSessionDate);
      setEditingSessionId(null);
      setEditSessionName('');
      setEditSessionDate('');
    }
  };

  const handleDeleteSession = (companyId: string, departmentId: string, sessionId: string, sessionName: string) => {
    if (confirm(`确定删除场次"${sessionName}"吗？所有问题都将被删除。`)) {
      removeSession(companyId, departmentId, sessionId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">面经记录</h1>
          <p className="text-gray-500">记录每一次面试，持续更新</p>
        </div>

        {/* 新增公司按钮 */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddingCompany(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Plus size={18} />
            新增公司
          </button>
        </div>

        {/* 新增公司表单 */}
        <AnimatePresence>
          {isAddingCompany && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="输入公司名称"
                  className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">选择色系:</span>
                  <div className="flex gap-2">
                    {COMPANY_COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewCompanyColor(color.value)}
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${COMPANY_COLOR_MAP[color.value]} ${
                          newCompanyColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddCompany}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Check size={16} />
                    确定
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCompany(false);
                      setNewCompanyName('');
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <X size={16} />
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 公司列表 */}
        {companies.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">暂无面经记录</p>
            <p className="text-gray-400 text-sm mt-1">点击上方"新增公司"开始记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* 公司行 */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCompany(company.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${COMPANY_COLOR_MAP[company.color]}`} />
                    {editingCompanyId === company.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editCompanyName}
                          onChange={(e) => setEditCompanyName(e.target.value)}
                          className="px-2 py-1 bg-white rounded border border-gray-200 text-sm outline-none"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={handleSaveEditCompany}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCompanyId(null)}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-gray-900">{company.name}</span>
                        <span className="text-sm text-gray-400">({company.departments.length} 个部门)</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingCompanyId !== company.id && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingDeptToCompany(company.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="新增部门"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCompany(company.id, company.name, company.color);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑公司"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(company.id, company.name);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除公司"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    {expandedCompanies.has(company.id) ? (
                      <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* 部门列表 */}
                <AnimatePresence>
                  {expandedCompanies.has(company.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 space-y-3">
                        {/* 新增部门 */}
                        {addingDeptToCompany === company.id && (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                            <input
                              type="text"
                              value={newDepartmentName}
                              onChange={(e) => setNewDepartmentName(e.target.value)}
                              placeholder="输入部门名称"
                              className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm outline-none"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleAddDepartment(company.id)}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddDepartment(company.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingDeptToCompany(null);
                                setNewDepartmentName('');
                              }}
                              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}

                        {company.departments.map((dept: any) => (
                          <div key={dept.id} className="space-y-2">
                            {/* 部门行 */}
                            <div
                              className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => toggleDepartment(dept.id)}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${DEPARTMENT_COLOR_MAP[company.color]}`} />
                                {editingDepartmentId === dept.id ? (
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      value={editDepartmentName}
                                      onChange={(e) => setEditDepartmentName(e.target.value)}
                                      className="px-2 py-1 bg-white rounded border border-gray-200 text-sm outline-none"
                                      autoFocus
                                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEditDepartment(company.id)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditDepartment(company.id)}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingDepartmentId(null)}
                                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-medium text-gray-800">{dept.name}</span>
                                    <span className="text-sm text-gray-400">({dept.sessions.length} 场)</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {editingDepartmentId !== dept.id && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDepartment(company.id, dept.id, dept.name);
                                      }}
                                      className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                      title="删除部门"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAddingSessionToDept(`${company.id}-${dept.id}`);
                                      }}
                                      className="p-1 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="新增场次"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </>
                                )}
                                {expandedDepartments.has(dept.id) ? (
                                  <ChevronDown size={16} className="text-gray-400" />
                                ) : (
                                  <ChevronRight size={16} className="text-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* 场次列表 */}
                            <AnimatePresence>
                              {expandedDepartments.has(dept.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="pl-6 space-y-2"
                                >
                                  {dept.sessions.map((session: any) => {
                                    const status = session.status as 'waiting' | 'passed' | 'failed';
                                    const StatusIcon = STATUS_CONFIG[status].icon;
                                    const isEditing = editingSessionId === session.id;
                                    return (
                                      <div
                                        key={session.id}
                                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 cursor-pointer transition-all hover:shadow-sm"
                                        onClick={() => !isEditing && handleSessionClick(company.id, dept.id, session.id)}
                                      >
                                        {isEditing ? (
                                          <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                                            <input
                                              type="text"
                                              value={editSessionName}
                                              onChange={(e) => setEditSessionName(e.target.value)}
                                              className="flex-1 px-2 py-1 bg-gray-50 rounded border border-gray-200 text-sm outline-none"
                                              autoFocus
                                            />
                                            <input
                                              type="date"
                                              value={editSessionDate}
                                              onChange={(e) => setEditSessionDate(e.target.value)}
                                              className="px-2 py-1 bg-gray-50 rounded border border-gray-200 text-sm outline-none"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleSaveEditSession(company.id, dept.id, session.id)}
                                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                                            >
                                              <Check size={14} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setEditingSessionId(null)}
                                              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex items-center gap-3">
                                              <span className="text-sm font-medium text-gray-700">{session.name}</span>
                                              <span className="text-gray-300">|</span>
                                              <Calendar size={14} className="text-gray-400" />
                                              <span className="text-sm text-gray-400">{session.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditSession(session.id, session.name, session.date);
                                                }}
                                                className="p-1 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="编辑场次"
                                              >
                                                <Pencil size={12} />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteSession(company.id, dept.id, session.id, session.name);
                                                }}
                                                className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="删除场次"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={(e) =>
                                                  handleStatusChange(e, company.id, dept.id, session.id, session.status)
                                                }
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[status].color}`}
                                              >
                                                <StatusIcon size={12} />
                                                {STATUS_CONFIG[status].label}
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {/* 新增场次 */}
                                  {addingSessionToDept === `${company.id}-${dept.id}` && (
                                    <div className="flex items-center gap-2 px-4 py-2">
                                      <input
                                        type="text"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        placeholder="场次名称(如一面)"
                                        className="flex-1 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSession(company.id, dept.id)}
                                      />
                                      <input
                                        type="date"
                                        value={newSessionDate}
                                        onChange={(e) => setNewSessionDate(e.target.value)}
                                        className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAddSession(company.id, dept.id)}
                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAddingSessionToDept(null);
                                          setNewSessionName('');
                                          setNewSessionDate('');
                                        }}
                                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
