import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Pomodoro } from '@/components/Pomodoro';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Heart, FileText, MessageSquare, Sparkles } from 'lucide-react';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/core', label: '核心考点' },
  { path: '/projects', label: '项目复盘' },
  { path: '/algorithms', label: '刷题模块' },
  { path: '/ai', label: 'AI资讯', icon: Sparkles },
  { path: '/resume', label: '简历', icon: FileText },
  { path: '/interview', label: '面经', icon: MessageSquare },
  { path: '/favorites', label: '收藏', icon: Heart },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">IF</span>
            </div>
            <span className="font-semibold text-text-secondary">InterviewFlash</span>
          </Link>

          {/* 导航 - MiniMax 胶囊按钮样式 */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5',
                    isActive
                      ? 'bg-black/5 text-text-secondary rounded-full'
                      : 'text-text-muted hover:text-text-secondary hover:bg-black/5 rounded-full'
                  )}
                >
                  {item.icon && (
                    <item.icon size={16} className={isActive ? 'text-brand-600' : 'text-text-tertiary'} />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 右侧功能 */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Pomodoro />
          </div>
        </div>
      </div>
    </header>
  );
}
