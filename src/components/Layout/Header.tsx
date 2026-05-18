import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Pomodoro } from '@/components/Pomodoro';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useThemeStore, THEME_CONFIGS } from '@/store/useThemeStore';
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
  const { themeColor } = useThemeStore();
  const gradient = THEME_CONFIGS[themeColor].gradient;

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* 简约风格图标 - 主题色渐变 */}
            <div className="relative w-8 h-8">
              {/* 外层 - 主题色渐变 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-lg`} />
              {/* 内层 - 黑色填充 */}
              <div className="absolute inset-[3px] bg-zinc-900 rounded-md flex items-center justify-center">
                <span className={`absolute inset-[3px] bg-gradient-to-br ${gradient} bg-clip-text text-transparent text-xs font-bold flex items-center justify-center`}>IF</span>
              </div>
            </div>
            <span className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100">
              InterviewFlash
            </span>
          </Link>

          {/* 导航 - 胶囊按钮样式 */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 rounded-full',
                    isActive
                      ? `bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg`
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white'
                  )}
                >
                  {item.icon && (
                    <item.icon size={16} className={isActive ? 'text-white' : 'text-zinc-500'} />
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
