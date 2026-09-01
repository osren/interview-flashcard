import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Home,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Rocket,
  Send,
  Sparkles,
  Bot,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Logo } from '@/components/Layout/Logo';
import { Pomodoro } from '@/components/Pomodoro';
import { useAuth, LoginModal, ProfileModal, UserAvatar } from '@/components/Auth';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: '学习',
    items: [
      { path: '/', label: '首页', icon: Home },
      { path: '/core', label: '核心考点', icon: BookOpen },
      { path: '/mpx', label: 'MPX', icon: Rocket },
      { path: '/projects', label: '项目复盘', icon: Briefcase },
      { path: '/llm-handbook', label: '大模型开发手册', icon: Bot },
    ],
  },
  {
    title: '求职',
    items: [
      { path: '/resume', label: '简历', icon: FileText },
      { path: '/campus', label: '秋招投递', icon: Send },
      { path: '/interview', label: '面经', icon: MessageSquare },
    ],
  },
  {
    title: '工具',
    items: [
      { path: '/ai', label: 'AI 资讯', icon: Sparkles },
      { path: '/favorites', label: '收藏', icon: Heart },
    ],
  },
];

const COLLAPSED_KEY = 'if-sidebar-collapsed';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const {
    user,
    loading,
    configured,
    signOut,
    displayName,
    profile,
    needsProfileSetup,
  } = useAuth();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (needsProfileSetup) setProfileOpen(true);
  }, [needsProfileSetup]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed]);

  useLayoutEffect(() => {
    document.documentElement.dataset.sidebarCollapsed = collapsed ? 'true' : 'false';
  }, [collapsed]);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
  };

  const sidebarWidth = collapsed ? 'w-[76px]' : 'w-[240px]';

  const renderNav = (compact: boolean) => (
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
      {navGroups.map((group) => (
        <div key={group.title}>
          {!compact && (
            <div className="px-3 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#afafaf]">
              {group.title}
            </div>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={compact ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl font-extrabold transition-all border-2',
                    compact ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                    active
                      ? 'bg-[#58CC02] text-white border-[#58CC02] border-b-[#46A302] border-b-4'
                      : 'text-[#777777] border-transparent hover:bg-[#f7f7f7] hover:text-[#4b4b4b]'
                  )}
                >
                  <Icon size={20} strokeWidth={2.5} className="flex-shrink-0" />
                  {!compact && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const renderUserBlock = (compact: boolean) => (
    <div className={cn('border-t-2 border-[#e5e5e5] p-3 space-y-2', compact && 'px-2')}>
      <div className={cn('flex justify-center', !compact && 'px-1')}>
        <Pomodoro compact={compact} />
      </div>

      {!loading && configured && (
        user ? (
          <div className={cn('space-y-1', compact && 'flex flex-col items-center')}>
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className={cn(
                'w-full flex items-center gap-2 rounded-xl hover:bg-[#f7f7f7] transition-colors',
                compact ? 'justify-center p-2' : 'px-2 py-2'
              )}
              title="编辑资料"
            >
              <UserAvatar name={displayName} avatarUrl={profile.avatar_url} size="sm" />
              {!compact && (
                <div className="min-w-0 text-left flex-1">
                  <div className="text-sm font-extrabold text-[#3c3c3c] truncate">{displayName}</div>
                  <div className="text-[11px] text-[#999999] truncate">{user.email}</div>
                </div>
              )}
            </button>
            {!compact ? (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-bold text-[#4b4b4b] bg-[#f7f7f7] hover:bg-[#efefef]"
                >
                  <UserRound size={14} />
                  资料
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-bold text-[#FF4B4B] bg-[#fff0f0] hover:bg-[#ffe0e0]"
                >
                  <LogOut size={14} />
                  退出
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 rounded-xl text-[#FF4B4B] hover:bg-[#fff0f0]"
                title="退出登录"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className={cn(
              'w-full flex items-center gap-2 rounded-xl font-extrabold text-[#1CB0F6] bg-[#f0f9ff] hover:bg-[#e0f2fe]',
              compact ? 'justify-center p-2.5' : 'px-3 py-2.5 text-sm'
            )}
            title="登录"
          >
            <LogIn size={18} />
            {!compact && '登录'}
          </button>
        )
      )}
    </div>
  );

  const sidebarBody = (compact: boolean) => (
    <>
      <div className={cn('flex items-center border-b-2 border-[#e5e5e5]', compact ? 'justify-center px-2 py-4' : 'gap-3 px-4 py-4')}>
        <Link to="/" className="flex items-center gap-3 min-w-0 group">
          <Logo size={compact ? 36 : 40} className="group-hover:scale-105 transition-transform flex-shrink-0" />
          {!compact && (
            <span className="font-extrabold text-xl text-[#58CC02] tracking-tight truncate">
              InterviewFlash
            </span>
          )}
        </Link>
      </div>
      {renderNav(compact)}
      {renderUserBlock(compact)}
    </>
  );

  return (
    <div className="min-h-screen app-bg flex">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-white border-r-2 border-[#e5e5e5] transition-[width] duration-200',
          sidebarWidth
        )}
      >
        {sidebarBody(collapsed)}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border-2 border-[#e5e5e5] text-[#777777] flex items-center justify-center hover:border-[#58CC02] hover:text-[#58CC02] shadow-sm"
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r-2 border-[#e5e5e5] flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#e5e5e5]">
                <span className="font-extrabold text-[#58CC02]">菜单</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl text-[#777777] hover:bg-[#f7f7f7]"
                  aria-label="关闭菜单"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarBody(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 min-h-screen transition-[padding] duration-200',
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[240px]'
        )}
      >
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-white/95 backdrop-blur border-b-2 border-[#e5e5e5] flex items-center justify-between px-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-[#777777] hover:bg-[#f7f7f7]"
            aria-label="打开菜单"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-extrabold text-lg text-[#58CC02]">InterviewFlash</span>
          </Link>
          <div className="w-10" />
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        required={needsProfileSetup}
      />
    </div>
  );
}
