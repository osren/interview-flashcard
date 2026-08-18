import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Pomodoro } from '@/components/Pomodoro';
import { Logo } from '@/components/Layout/Logo';
import { useAuth, LoginModal } from '@/components/Auth';
import {
  Heart, FileText, MessageSquare, Sparkles, Menu, X, Send, LogIn, LogOut,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/core', label: '核心考点' },
  { path: '/mpx', label: 'MPX' },
  { path: '/projects', label: '项目复盘' },
  { path: '/algorithms', label: '刷题' },
  { path: '/ai', label: 'AI资讯', icon: Sparkles },
  { path: '/resume', label: '简历', icon: FileText },
  { path: '/campus', label: '秋招投递', icon: Send },
  { path: '/interview', label: '面经', icon: MessageSquare },
  { path: '/favorites', label: '收藏', icon: Heart },
];

export function Header() {
  const location = useLocation();
  const { user, loading, configured, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-[#e5e5e5]">
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
                    active
                      ? 'text-[#58CC02]'
                      : 'text-[#777777] hover:text-[#4b4b4b]'
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

          {/* 中等屏幕：精简导航 */}
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
            {!loading && configured && (
              user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="max-w-[140px] truncate text-xs font-bold text-[#777777]">
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-extrabold text-[#777777] hover:bg-[#f7f7f7]"
                    title="退出登录"
                  >
                    <LogOut size={16} />
                    退出
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-extrabold text-[#1CB0F6] hover:bg-[#f0f9ff]"
                >
                  <LogIn size={16} />
                  登录
                </button>
              )
            )}
            <Pomodoro />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 rounded-xl text-[#777777] hover:bg-[#f7f7f7]"
              aria-label="菜单"
            >
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t-2 border-[#e5e5e5] bg-white overflow-hidden"
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
                        : 'bg-white text-[#777777] border-[#e5e5e5] border-b-[#d0d0d0] hover:bg-[#f7f7f7]'
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

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
