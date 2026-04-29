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

// 模块主题色配置 - 黄黑色调
const moduleColors: Record<string, { gradient: string; icon: string }> = {
  '/': { gradient: 'from-yellow-400 to-amber-500', icon: 'text-yellow-600' },
  '/core': { gradient: 'from-yellow-400 to-amber-500', icon: 'text-yellow-600' },
  '/projects': { gradient: 'from-yellow-500 to-orange-500', icon: 'text-orange-600' },
  '/algorithms': { gradient: 'from-amber-500 to-yellow-600', icon: 'text-amber-700' },
  '/ai': { gradient: 'from-yellow-400 to-orange-400', icon: 'text-orange-600' },
  '/resume': { gradient: 'from-yellow-500 to-amber-600', icon: 'text-amber-700' },
  '/interview': { gradient: 'from-amber-400 to-yellow-500', icon: 'text-amber-600' },
  '/favorites': { gradient: 'from-yellow-400 to-amber-500', icon: 'text-yellow-600' },
};

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-yellow-50/90 backdrop-blur-sm border-b border-yellow-200 dark:bg-zinc-900/90 dark:border-zinc-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* 简约风格图标 - 双层圆角方块 */}
            <div className="relative w-8 h-8">
              {/* 外层 - 黄色渐变 */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg" />
              {/* 内层 - 黑色填充 */}
              <div className="absolute inset-[3px] bg-zinc-900 rounded-md flex items-center justify-center">
                <span className="text-yellow-400 text-xs font-bold">IF</span>
              </div>
            </div>
            <span className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100">
              InterviewFlash
            </span>
          </Link>

          {/* 导航 - 黄黑胶囊按钮样式 */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const colors = moduleColors[item.path] || moduleColors['/'];
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 rounded-full',
                    isActive
                      ? `bg-gradient-to-r ${colors.gradient} text-zinc-900 font-semibold shadow-lg`
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                  )}
                >
                  {item.icon && (
                    <item.icon size={16} className={isActive ? 'text-zinc-900' : 'text-zinc-500'} />
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
