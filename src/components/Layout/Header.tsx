import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Logo } from '@/components/Layout/Logo';
import { useAuth, LoginModal, ProfileModal, UserAvatar } from '@/components/Auth';
import {
  Heart, FileText, MessageSquare, Sparkles, Menu, X, Send, LogIn, LogOut, UserRound,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/core', label: '核心考点' },
  { path: '/mpx', label: 'MPX' },
  { path: '/projects', label: '项目复盘' },
  { path: '/ai', label: 'AI资讯', icon: Sparkles },
  { path: '/resume', label: '简历', icon: FileText },
  { path: '/campus', label: '秋招投递', icon: Send },
  { path: '/interview', label: '面经', icon: MessageSquare },
  { path: '/favorites', label: '收藏', icon: Heart },
];

export function Header() {
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (needsProfileSetup) {
      setProfileOpen(true);
    }
  }, [needsProfileSetup]);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  const handleOpenProfile = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    setProfileOpen(true);
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await signOut();
  };

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
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((open) => !open)}
                    className="inline-flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#f7f7f7] transition-colors"
                    title="账号菜单"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <UserAvatar
                      name={displayName}
                      avatarUrl={profile.avatar_url}
                      size="sm"
                    />
                    <span className="max-w-[100px] truncate text-sm font-extrabold text-[#4b4b4b]">
                      {displayName}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-2xl border-2 border-[#e5e5e5] border-b-4 border-b-[#d0d0d0] bg-white shadow-lg overflow-hidden z-50"
                        role="menu"
                      >
                        <div className="px-3 py-2.5 border-b border-[#e5e5e5]">
                          <div className="text-sm font-extrabold text-[#3c3c3c] truncate">{displayName}</div>
                          <div className="text-xs text-[#999999] truncate">{user.email}</div>
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleOpenProfile}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-[#4b4b4b] hover:bg-[#f7f7f7]"
                        >
                          <UserRound size={16} />
                          编辑资料
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-[#FF4B4B] hover:bg-[#fff0f0]"
                        >
                          <LogOut size={16} />
                          退出登录
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
            {user && (
              <div className="px-4 pt-4 space-y-2">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    name={displayName}
                    avatarUrl={profile.avatar_url}
                    size="md"
                  />
                  <div className="min-w-0 text-left">
                    <div className="font-extrabold text-[#3c3c3c] truncate">{displayName}</div>
                    <div className="text-xs text-[#999999] truncate">{user.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenProfile}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold text-[#4b4b4b] bg-[#f7f7f7]"
                  >
                    <UserRound size={16} />
                    编辑资料
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold text-[#FF4B4B] bg-[#fff0f0]"
                  >
                    <LogOut size={16} />
                    退出登录
                  </button>
                </div>
              </div>
            )}
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
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        required={needsProfileSetup}
      />
    </header>
  );
}
