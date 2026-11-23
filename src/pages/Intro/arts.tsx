import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  Cloud,
  FileText,
  Lock,
  MessageSquare,
  Repeat,
  Send,
  Sparkles,
} from 'lucide-react';

/** 统一外框：与全站 surface-panel 一致的 2px 边框 + 4px 底边 */
function ArtFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border-2 border-[#e5e5e5] border-b-4 border-b-[#d0d0d0] bg-white p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function ArtLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-[#f7f7f7] px-2 py-1 text-[12px] font-extrabold text-[#777777]">
      {children}
    </span>
  );
}

/** 封面：卡片堆 + 翻面结果 */
export function HeroDeck() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute inset-x-6 top-4 h-[190px] rounded-2xl border-2 border-[#e5e5e5] bg-[#f7f7f7]" />
      <div className="absolute inset-x-3 top-2 h-[190px] rounded-2xl border-2 border-[#e5e5e5] bg-white" />

      <div className="relative rounded-2xl border-2 border-[#58CC02] border-b-4 border-b-[#46A302] bg-white p-5">
        <div className="flex items-center justify-between">
          <ArtLabel>
            <BookOpen size={13} strokeWidth={2.8} /> 前端基础 · 第 3 章
          </ArtLabel>
          <span className="text-[12px] font-extrabold text-[#afafaf]">第 12 张</span>
        </div>

        <h4 className="mt-4 text-[19px] font-extrabold leading-snug text-[#3c3c3c]">
          HTTP 缓存有哪几种，分别拦在哪一层？
        </h4>

        <div className="mt-3 space-y-2 border-t-2 border-dashed border-[#e5e5e5] pt-3">
          <p className="text-[14px] font-bold leading-relaxed text-[#777777]">
            <span className="text-[#58CC02]">强缓存：</span>
            Cache-Control / Expires，命中不发请求。
          </p>
          <p className="text-[14px] font-bold leading-relaxed text-[#777777]">
            <span className="text-[#58CC02]">协商缓存：</span>
            ETag / Last-Modified，304 复用本地副本。
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-9 flex-1 items-center justify-center rounded-xl border-2 border-[#e5e5e5] text-[13px] font-extrabold text-[#777777]">
            没记住
          </div>
          <div className="flex h-9 flex-1 items-center justify-center gap-1 rounded-xl bg-[#58CC02] border-b-4 border-b-[#46A302] text-[13px] font-extrabold text-white">
            <Check size={14} strokeWidth={3} /> 记住了
          </div>
        </div>
      </div>

      <div className="mx-auto mt-3 h-2 w-[88%] overflow-hidden rounded-full bg-[#e5e5e5]">
        <div className="h-full w-1/4 rounded-full bg-[#58CC02]" />
      </div>
    </div>
  );
}

/** 01 核心考点：章节切片 */
export function CoreArt() {
  const chapters = [
    { name: 'JavaScript 基础', done: 86 },
    { name: 'TypeScript 类型', done: 54 },
    { name: 'React 原理', done: 37 },
    { name: '浏览器与网络', done: 12 },
  ];

  return (
    <ArtFrame>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold text-[#3c3c3c]">核心考点</span>
        <ArtLabel>按章节推进</ArtLabel>
      </div>
      <div className="mt-3 space-y-2.5">
        {chapters.map((chapter) => (
          <div key={chapter.name}>
            <div className="flex items-center justify-between text-[13px] font-extrabold text-[#777777]">
              <span>{chapter.name}</span>
              <span className="text-[#58CC02]">{chapter.done}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
              <div
                className="h-full rounded-full bg-[#58CC02]"
                style={{ width: `${chapter.done}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ArtFrame>
  );
}

/** 02 项目复盘：四套项目卡 */
export function ProjectArt() {
  const projects = [
    { name: 'InterviewFlash', hint: '前端性能 · 可观测', done: 72 },
    { name: '滴滴实习', hint: '监控 · 告警降噪', done: 60 },
    { name: 'GResume', hint: '编辑器 · 同步', done: 41 },
    { name: 'AI 降噪链路', hint: '工程取舍', done: 28 },
  ];

  return (
    <ArtFrame>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold text-[#3c3c3c]">项目复盘</span>
        <ArtLabel>
          <Briefcase size={13} strokeWidth={2.8} /> 4 套
        </ArtLabel>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {projects.map((project) => (
          <div
            key={project.name}
            className="rounded-xl border-2 border-[#e5e5e5] bg-[#fafafa] p-3"
          >
            <div className="truncate text-[13px] font-extrabold text-[#3c3c3c]">{project.name}</div>
            <div className="mt-0.5 truncate text-[11px] font-bold text-[#afafaf]">{project.hint}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ececec]">
              <div className="h-full rounded-full bg-[#1CB0F6]" style={{ width: `${project.done}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] font-bold leading-relaxed text-[#afafaf]">
        背景 → 难点 → 取舍 → 收益，一层一层拆开。
      </p>
    </ArtFrame>
  );
}

/** 03 面经生成：问题清单 → 分点答案 */
export function InterviewArt() {
  return (
    <ArtFrame>
      <div className="rounded-xl border-2 border-[#e5e5e5] bg-[#fafafa] p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#afafaf]">
          <MessageSquare size={12} strokeWidth={2.8} /> 粘贴问题清单
        </div>
        <p className="mt-1.5 text-[13px] font-bold leading-relaxed text-[#777777]">
          自我介绍
          <br />
          项目里最难的地方是什么？
          <br />
          追问：为什么不用阈值告警？
        </p>
      </div>

      <div className="my-3 flex items-center justify-center gap-2 text-[12px] font-extrabold text-[#1CB0F6]">
        <Sparkles size={13} strokeWidth={2.8} /> 按主简历生成
        <ArrowRight size={13} strokeWidth={2.8} />
      </div>

      <div className="rounded-xl border-2 border-[#58CC02] border-b-4 border-b-[#46A302] p-3">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-[#f0fde4] px-1.5 py-0.5 text-[10px] font-extrabold text-[#46A302]">
            字节 · 前端 · 一面
          </span>
        </div>
        <h5 className="mt-2 text-[13px] font-extrabold text-[#3c3c3c]">
          1. 项目里最难的地方是什么？
        </h5>
        <ul className="mt-1.5 space-y-1 text-[12px] font-bold leading-relaxed text-[#777777]">
          <li>
            <strong className="text-[#3c3c3c]">难点定位：</strong>告警量大，误报吞掉真故障。
          </li>
          <li>
            <strong className="text-[#3c3c3c]">方案取舍：</strong>规则先行，模型只判语义层。
          </li>
        </ul>
        <p className="mt-2 border-l-2 border-[#e5e5e5] pl-2 text-[11px] font-bold text-[#afafaf]">
          追问：为什么不用阈值告警？
        </p>
      </div>
    </ArtFrame>
  );
}

/** 04 追问与掌握度 */
export function FollowUpArt() {
  const levels = ['未开始', '有印象', '能复述', '能讲透'];

  return (
    <ArtFrame>
      <div className="flex items-start justify-between gap-2">
        <h5 className="text-[13px] font-extrabold leading-snug text-[#3c3c3c]">
          JS 怎么形成闭包的？
        </h5>
        <span className="shrink-0 rounded-lg bg-[#fff7dc] px-1.5 py-0.5 text-[10px] font-extrabold text-[#e5b800]">
          收藏
        </span>
      </div>

      <div className="mt-2 space-y-1 border-l-2 border-[#e5e5e5] pl-2.5">
        <p className="text-[12px] font-bold text-[#777777]">函数被外部持有</p>
        <p className="text-[12px] font-bold text-[#777777]">内层变量何时释放</p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {levels.map((level, index) => (
          <div
            key={level}
            className={`rounded-lg border-2 px-1 py-1.5 text-center text-[10px] font-extrabold ${
              index < 2
                ? 'border-[#58CC02] bg-[#f0fde4] text-[#46A302]'
                : 'border-[#e5e5e5] bg-white text-[#afafaf]'
            }`}
          >
            {level}
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[11px] font-bold text-[#afafaf]">
        追问挂在原题下，不另起一节；按掌握度筛复习。
      </p>
    </ArtFrame>
  );
}

/** 05 简历：多份 + 主简历 + Diff */
export function ResumeArt() {
  const resumes = [
    { name: '虎子同学_字节投递', tag: '主简历', primary: true },
    { name: '虎子同学_秋招求职简历', tag: '全栈', primary: false },
    { name: '虎子同学_简历_通用版', tag: '通用', primary: false },
  ];

  return (
    <ArtFrame>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold text-[#3c3c3c]">简历库</span>
        <ArtLabel>
          <FileText size={13} strokeWidth={2.8} /> 3 份
        </ArtLabel>
      </div>

      <div className="mt-2.5 space-y-2">
        {resumes.map((resume) => (
          <div
            key={resume.name}
            className={`flex items-center gap-2 rounded-xl border-2 px-2.5 py-2 ${
              resume.primary ? 'border-[#58CC02] bg-[#f0fde4]' : 'border-[#e5e5e5] bg-white'
            }`}
          >
            <FileText
              size={15}
              strokeWidth={2.6}
              className={resume.primary ? 'text-[#46A302]' : 'text-[#afafaf]'}
            />
            <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold text-[#3c3c3c]">
              {resume.name}
            </span>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                resume.primary
                  ? 'bg-[#58CC02] text-white'
                  : 'bg-[#f7f7f7] text-[#afafaf]'
              }`}
            >
              {resume.tag}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-[#fafafa] p-2.5 text-[11px] font-bold leading-relaxed">
        <p className="text-[#ff4b4b]">− 参与告警降噪项目的开发。</p>
        <p className="mt-1 text-[#46A302]">+ 主导规则层重构，误报压降后真故障不再被吞。</p>
      </div>
    </ArtFrame>
  );
}

/** 06 投递：状态时间线 */
export function CampusArt() {
  const steps = [
    { date: '11.04', label: '投递', state: 'done' },
    { date: '11.07', label: '笔试', state: 'done' },
    { date: '11.11', label: '一面 14:00', state: 'active' },
    { date: '—', label: '二面', state: 'todo' },
  ];

  return (
    <ArtFrame>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold text-[#3c3c3c]">秋招投递</span>
        <ArtLabel>
          <Send size={13} strokeWidth={2.8} /> 面试中
        </ArtLabel>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-extrabold ${
                  step.state === 'done'
                    ? 'border-[#58CC02] bg-[#58CC02] text-white'
                    : step.state === 'active'
                      ? 'border-[#1CB0F6] bg-[#e8f7ff] text-[#1889c0]'
                      : 'border-[#e5e5e5] bg-white text-[#afafaf]'
                }`}
              >
                {step.state === 'done' ? <Check size={13} strokeWidth={3} /> : index + 1}
              </div>
              <span className="whitespace-nowrap text-[10px] font-extrabold text-[#777777]">
                {step.date}
              </span>
              <span className="whitespace-nowrap text-[10px] font-bold text-[#afafaf]">
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-1 mb-7 h-0.5 flex-1 ${
                  step.state === 'done' ? 'bg-[#58CC02]' : 'bg-[#ececec]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="mt-2 text-[11px] font-bold text-[#afafaf]">
        每条记录投递时间、所用简历版本与面试安排。
      </p>
    </ArtFrame>
  );
}

/** 07 同步：本地优先 + 增量合并 */
export function SyncArt() {
  return (
    <ArtFrame>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold text-[#3c3c3c]">云端同步</span>
        <ArtLabel>
          <Cloud size={13} strokeWidth={2.8} /> 增量合并
        </ArtLabel>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {['手机', '笔记本'].map((device) => (
          <div
            key={device}
            className="flex-1 rounded-xl border-2 border-[#e5e5e5] bg-[#fafafa] px-2 py-3 text-center text-[11px] font-extrabold text-[#777777]"
          >
            {device}
            <div className="mt-1 text-[10px] font-bold text-[#afafaf]">本地优先读写</div>
          </div>
        ))}
        <Repeat size={16} strokeWidth={2.8} className="shrink-0 text-[#1CB0F6]" />
        <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-[#1CB0F6] bg-[#e8f7ff] px-2 py-3 text-[11px] font-extrabold text-[#1889c0]">
          合并后一致
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#f0fde4] p-2.5">
        <Lock size={13} strokeWidth={2.8} className="mt-0.5 shrink-0 text-[#46A302]" />
        <p className="text-[11px] font-bold leading-relaxed text-[#46A302]">
          删除记墓碑：下次合并时，删掉的记录不会被旧数据带回来。
        </p>
      </div>
    </ArtFrame>
  );
}

/** 08 每日节奏 */
export function DailyArt() {
  const days = [
    { day: '一', done: true },
    { day: '二', done: true },
    { day: '三', done: true },
    { day: '四', done: false },
    { day: '五', done: true },
    { day: '六', done: false },
    { day: '日', done: false },
  ];

  return (
    <ArtFrame>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold text-[#3c3c3c]">今日任务</span>
        <ArtLabel>今日打卡</ArtLabel>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {days.map((item, index) => (
          <div key={index} className="text-center">
            <div
              className={`flex h-8 items-center justify-center rounded-lg border-2 ${
                item.done
                  ? 'border-[#58CC02] bg-[#f0fde4] text-[#46A302]'
                  : 'border-[#e5e5e5] bg-white text-[#d0d0d0]'
              }`}
            >
              {item.done ? <Check size={14} strokeWidth={3} /> : <span className="text-[10px]">·</span>}
            </div>
            <span className="mt-1 block text-[10px] font-bold text-[#afafaf]">{item.day}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {[
          { label: '复习「浏览器缓存」12 张', done: true },
          { label: '过一遍项目复盘：告警降噪', done: false },
          { label: '面经：字节一面 8 个追问', done: false },
        ].map((task) => (
          <div
            key={task.label}
            className="flex items-center gap-2 rounded-lg border-2 border-[#e5e5e5] px-2 py-1.5"
          >
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                task.done ? 'border-[#58CC02] bg-[#58CC02]' : 'border-[#e5e5e5]'
              }`}
            >
              {task.done && <Check size={10} strokeWidth={3} className="text-white" />}
            </div>
            <span className="truncate text-[11px] font-bold text-[#777777]">{task.label}</span>
          </div>
        ))}
      </div>
    </ArtFrame>
  );
}

/** 结尾用的提示条 */
export function ClosingHintArt() {
  return (
    <ArtFrame className="bg-[#f7f7f7]">
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[#ffc800]" />
        <p className="text-[12px] font-bold leading-relaxed text-[#777777]">
          介绍页只看一次；标记已读后，再打开就是工作台，不会重复弹出。
        </p>
      </div>
    </ArtFrame>
  );
}
