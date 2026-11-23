import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUp, Check, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/Layout/Logo';
import { Button } from '@/components/ui';
import { markIntroSeen } from '@/lib/intro';
import {
  CampusArt,
  ClosingHintArt,
  CoreArt,
  DailyArt,
  FollowUpArt,
  HeroDeck,
  InterviewArt,
  ProjectArt,
  ResumeArt,
  SyncArt,
} from './arts';

interface Chapter {
  id: string;
  no: string;
  kicker: string;
  title: string;
  text: string;
  points: string[];
  art: ReactNode;
}

const chapters: Chapter[] = [
  {
    id: 'core',
    no: '01',
    kicker: '核心考点',
    title: '这一章，你记住了多少？',
    text: 'JavaScript、TypeScript、React、浏览器、手写题按章节切片，一张卡只放一个问题。正面是问题，翻过来是答案；记住与没记住分开记，进度按章节自己走。',
    points: ['按章节推进，不从头重刷', '翻转看答案，先自己想一遍', '记住状态即时写回进度'],
    art: <CoreArt />,
  },
  {
    id: 'projects',
    no: '02',
    kicker: '项目复盘',
    title: '这个项目，你讲得清楚吗？',
    text: 'InterviewFlash、滴滴实习、告警降噪、GResume 各有一套卡片，按背景、难点、取舍、收益拆开。面试官问到哪一层，都能顺着往下讲。',
    points: ['每个项目单独成章', '先讲取舍，再讲结果', '把简历上的句子练成一段话'],
    art: <ProjectArt />,
  },
  {
    id: 'interview',
    no: '03',
    kicker: 'AI 面经',
    title: '一场面试问完，答案还在脑子里吗？',
    text: '把面试官问过的问题原样粘进来，选好公司、岗位、场次，AI 按主简历里的项目和背景写答案：分点陈述、小标题加粗，追问挂在原题下面。',
    points: ['问题清单直接粘贴，不用重抄', '答案引项目细节，不写套话', '生成结果可追加、可再补问题'],
    art: <InterviewArt />,
  },
  {
    id: 'followup',
    no: '04',
    kicker: '追问与掌握度',
    title: '追问到第三层，你还接得住吗？',
    text: '追问以四级标题挂在原题下，不另起一节；每道题标四档掌握度，零散重点可以收藏。复习时按掌握度筛，先补「有印象」那一档。',
    points: ['追问挂在原题下，层级不乱', '四档掌握度，知道先补什么', '收藏高频题，单独成页'],
    art: <FollowUpArt />,
  },
  {
    id: 'resume',
    no: '05',
    kicker: '简历',
    title: '投十个岗位，要用同一份简历吗？',
    text: '不同岗位各存一版，指定其中一份为主简历；AI 生成面经时注入它的项目与背景。按 JD 逐条对照，改动前后逐句对比。',
    points: ['多份并存，随时切换主简历', '主简历决定 AI 的口径', 'JD 优化后看 Diff，确认改了什么'],
    art: <ResumeArt />,
  },
  {
    id: 'campus',
    no: '06',
    kicker: '秋招投递',
    title: '投过哪些、哪天面试，记得住吗？',
    text: '投递看板按状态分列，每条记录投递日期、所用简历版本与面试安排。阶段推进留痕，复盘时看得到自己的节奏。',
    points: ['状态、时间、简历版本一起记', '面试安排带提醒', '按阶段回看投递密度'],
    art: <CampusArt />,
  },
  {
    id: 'sync',
    no: '07',
    kicker: '云端同步',
    title: '换台设备，进度还在吗？',
    text: '本地优先读写，登录后增量合并。删除会留墓碑，下次合并不会把删掉的记录带回来；离线时照常练，联网后自动对齐。',
    points: ['本地优先，断网也能刷', '登录后增量合并，不覆盖新数据', '删除不复活'],
    art: <SyncArt />,
  },
  {
    id: 'daily',
    no: '08',
    kicker: '每日节奏',
    title: '每天练多少，才不算白练？',
    text: '今日任务列出当天要过的卡片与面经，连续打卡记录节奏，番茄钟控制单次专注时长。遇到讲不清的点，直接问 AI 伴学。',
    points: ['今日任务当天结算', '连续打卡看得见', '讲不清就问，答案落回卡片'],
    art: <DailyArt />,
  },
];

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

export function Intro() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const guideRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const enterWorkspace = () => {
    markIntroSeen();
    navigate('/');
  };

  const scrollToGuide = () => {
    guideRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div id="intro-top" className="min-h-screen bg-white">
      <header
        className={`sticky top-0 z-40 border-b-2 transition-colors ${
          scrolled
            ? 'border-[#e5e5e5] bg-white/95 backdrop-blur'
            : 'border-transparent bg-white'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:h-[72px] sm:px-6">
          <a href="#intro-top" className="flex min-w-0 items-center gap-2.5">
            <Logo size={34} />
            <span className="truncate text-lg font-extrabold tracking-tight text-[#58CC02]">
              InterviewFlash
            </span>
            <span className="hidden rounded-lg bg-[#f7f7f7] px-2 py-1 text-[11px] font-extrabold text-[#afafaf] sm:inline">
              使用介绍
            </span>
          </a>
          <Button size="sm" onClick={enterWorkspace} className="shrink-0">
            进入工作台
            <ArrowRight size={16} strokeWidth={3} />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* 封面 */}
        <section className="border-b-2 border-[#f0f0f0] py-12 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#58CC02]">
                2027 秋招 · 面试闪卡工作台
              </p>
              <h1 className="mt-3 text-[34px] font-extrabold leading-[1.15] text-[#3c3c3c] sm:text-[46px]">
                把每一次面试，
                <br />
                练成一次<span className="text-[#58CC02]">复述</span>。
              </h1>
              <p className="mt-4 max-w-md text-[16px] font-bold leading-relaxed text-[#777777]">
                核心考点、项目复盘、AI 面经、简历与投递，都在一张卡片上练。
                翻到能自己讲出来为止，剩下的交给进度记录。
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={enterWorkspace}>
                  进入工作台
                  <ArrowRight size={18} strokeWidth={3} />
                </Button>
                <Button size="lg" variant="secondary" onClick={scrollToGuide}>
                  看看怎么用
                  <ChevronDown size={18} strokeWidth={3} />
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {['无需登录可刷', '本地优先 · 云端同步', '面经按场次归档'].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#afafaf]"
                  >
                    <Check size={14} strokeWidth={3} className="text-[#58CC02]" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="px-2 sm:px-6"
            >
              <HeroDeck />
            </motion.div>
          </div>
        </section>

        {/* 分章介绍 */}
        <div ref={guideRef} id="guide" className="scroll-mt-20">
          <div className="flex items-end justify-between gap-4 border-b-2 border-[#f0f0f0] py-10">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#afafaf]">
                Guide
              </p>
              <h2 className="mt-1.5 text-[24px] font-extrabold text-[#3c3c3c] sm:text-[28px]">
                八幕，走一遍就会用
              </h2>
            </div>
            <span className="hidden text-[13px] font-bold text-[#afafaf] sm:block">
              01 — 08
            </span>
          </div>

          <div className="space-y-16 py-12 sm:space-y-20">
            {chapters.map((chapter, index) => {
              const artFirst = index % 2 === 1;
              return (
                <motion.section
                  key={chapter.id}
                  id={chapter.id}
                  {...(reduceMotion ? {} : fade)}
                  transition={{ duration: 0.5 }}
                  className="scroll-mt-24"
                >
                  <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                    <div className={artFirst ? 'lg:order-2' : ''}>
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-extrabold tracking-[0.12em] text-[#58CC02]">
                          {chapter.no}
                        </span>
                        <span className="h-px flex-1 bg-[#f0f0f0]" />
                        <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#afafaf]">
                          {chapter.kicker}
                        </span>
                      </div>

                      <h3 className="mt-4 text-[22px] font-extrabold leading-snug text-[#3c3c3c] sm:text-[26px]">
                        {chapter.title}
                      </h3>
                      <p className="mt-3 max-w-md text-[15px] font-bold leading-relaxed text-[#777777]">
                        {chapter.text}
                      </p>

                      <ul className="mt-5 space-y-2">
                        {chapter.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-2 text-[14px] font-bold text-[#4b4b4b]"
                          >
                            <Check
                              size={15}
                              strokeWidth={3}
                              className="mt-0.5 shrink-0 text-[#58CC02]"
                            />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className={`mx-auto w-full max-w-[420px] ${
                        artFirst ? 'lg:order-1' : ''
                      }`}
                    >
                      {chapter.art}
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>

        {/* 结尾 */}
        <section className="border-t-2 border-[#f0f0f0] py-14 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#afafaf]">
                Start here
              </p>
              <h2 className="mt-2 text-[28px] font-extrabold leading-snug text-[#3c3c3c] sm:text-[34px]">
                从十张核心卡开始。
              </h2>
              <p className="mt-3 max-w-md text-[15px] font-bold leading-relaxed text-[#777777]">
                不用登录也能刷，进度先存本地；登录后走云端，换设备接着来。
                第一次用，建议从「核心考点」第一章开始。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" onClick={enterWorkspace}>
                  进入工作台
                  <ArrowRight size={18} strokeWidth={3} />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/core')}
                >
                  直接刷核心考点
                </Button>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[420px]">
              <ClosingHintArt />
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {['核心考点', '项目复盘', '简历与投递'].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border-2 border-[#e5e5e5] border-b-4 border-b-[#d0d0d0] bg-white px-2 py-3 text-center text-[12px] font-extrabold text-[#4b4b4b]"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-[#e5e5e5] bg-[#fafafa]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2 text-[13px] font-extrabold text-[#afafaf]">
            <Logo size={20} /> InterviewFlash · 2027 秋招
          </span>
          <a
            href="#intro-top"
            className="inline-flex items-center gap-1 text-[13px] font-extrabold text-[#777777] hover:text-[#58CC02]"
          >
            回到封面
            <ArrowUp size={14} strokeWidth={3} />
          </a>
        </div>
      </footer>
    </div>
  );
}
