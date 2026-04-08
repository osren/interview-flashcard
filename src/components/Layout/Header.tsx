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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">IF</span>
            </div>
            <span className="font-semibold text-gray-900">InterviewFlash</span>
          </Link>

          {/* 导航 */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                  location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path))
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {item.icon && <item.icon size={16} className={location.pathname === item.path ? 'text-primary-600' : ''} />}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 番茄钟 */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Pomodoro />
          </div>
        </div>
      </div>
    </header>
  );
}
