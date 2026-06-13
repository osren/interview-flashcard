import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Pomodoro } from '@/components/Pomodoro';
import { Logo } from '@/components/Layout/Logo';
import { useCardStore } from '@/store';
import {
  Heart, FileText, MessageSquare, Sparkles, X,
  Home, BookOpen, Code, LayoutGrid,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/core', label: '核心考点' },
  { path: '/mpx', label: 'MPX' },
  { path: '/projects', label: '项目复盘' },
  { path: '/algorithms', label: '刷题' },
  { path: '/ai', label: 'AI资讯', icon: Sparkles },
  { path: '/resume', label: '简历', icon: FileText },
  { path: '/interview', label: '面经', icon: MessageSquare },
  { path: '/favorites', label: '收藏', icon: Heart },
];

const bottomNavItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/core', label: '考点', icon: BookOpen },
  { path: '/algorithms', label: '刷题', icon: Code },
  { path: '/favorites', label: '收藏', icon: Heart },
];

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevLocationRef = useRef(location.pathname);
  const { lastVisitedCoreChapter, lastVisitedProject, lastVisitedAlgorithm } = useCardStore();

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  useEffect(() => {
    const prev = prevLocationRef.current;
    const current = location.pathname;

    if (prev.startsWith('/core/') && !current.startsWith('/core/')) {
      sessionStorage.setItem('from_core_detail', lastVisitedCoreChapter || 'true');
    }
    if (prev.startsWith('/projects/') && !current.startsWith('/projects/')) {
      sessionStorage.setItem('from_project_detail', lastVisitedProject || 'true');
    }
    if (prev.startsWith('/algorithms/') && !current.startsWith('/algorithms/')) {
      sessionStorage.setItem('from_algorithm_detail', lastVisitedAlgorithm || 'true');
    }

    prevLocationRef.current = current;
  }, [location.pathname, lastVisitedCoreChapter, lastVisitedProject, lastVisitedAlgorithm]);

  const isMoreActive = !bottomNavItems.some((item) => isActive(item.path)) &&
    navItems.some((item) => !bottomNavItems.find((b) => b.path === item.path) && isActive(item.path));

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b-2 border-[#e5e5e5] safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <Logo size={44} className="group-hover:scale-105 transition-transform" />
              <span className="hidden sm:block font-extrabold text-2xl text-[#58CC02] tracking-tight">
                InterviewFlash
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'relative px-3.5 py-5 text-lg font-extrabold transition-colors flex items-center gap-1.5 whitespace-nowrap',
                      active ? 'text-[#58CC02]' : 'text-[#777777] hover:text-[#4b4b4b]'
                    )}
                  >
                    {item.icon && <item.icon size={18} strokeWidth={2.5} />}
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="duo-nav-underline"
                        className="absolute bottom-0 left-2 right-2 h-1 bg-[#58CC02] rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <nav className="hidden lg:flex xl:hidden items-center gap-1">
              {navItems.slice(0, 6).map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'relative px-2.5 py-5 text-base font-extrabold transition-colors whitespace-nowrap',
                      active ? 'text-[#58CC02]' : 'text-[#777777] hover:text-[#4b4b4b]'
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="duo-nav-underline-md"
                        className="absolute bottom-0 left-1 right-1 h-1 bg-[#58CC02] rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Pomodoro />
            </div>
          </div>
        </div>
      </header>

      {/* 移动端顶部栏 */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b-2 border-[#e5e5e5] safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={36} />
            <span className="font-extrabold text-lg text-[#58CC02]">InterviewFlash</span>
          </Link>
          <Pomodoro />
        </div>
      </header>

      {/* 移动端更多菜单 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="md:hidden fixed inset-x-0 bottom-16 z-50 border-t-2 border-[#e5e5e5] bg-white overflow-hidden max-h-[50vh] overflow-y-auto"
          >
            <nav className="px-4 py-4 grid grid-cols-3 gap-2.5">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-2xl text-sm font-extrabold transition-all border-2 border-b-4',
                      active
                        ? 'bg-[#58CC02] text-white border-[#58CC02] border-b-[#46A302]'
                        : 'bg-white text-[#777777] border-[#e5e5e5] border-b-[#d0d0d0]'
                    )}
                  >
                    {item.icon && <item.icon size={18} strokeWidth={2.5} />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#e5e5e5] safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[56px]',
                  active ? 'text-[#58CC02]' : 'text-[#afafaf]'
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-xs font-extrabold">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[56px]',
              mobileOpen || isMoreActive ? 'text-[#58CC02]' : 'text-[#afafaf]'
            )}
            aria-label="更多"
          >
            {mobileOpen ? <X size={22} strokeWidth={2.5} /> : <LayoutGrid size={22} strokeWidth={2} />}
            <span className="text-xs font-extrabold">更多</span>
          </button>
        </div>
      </nav>
    </>
  );
}
