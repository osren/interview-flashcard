import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { Pomodoro } from '@/components/Pomodoro';
import { Home, BookOpen, Briefcase, Code, Heart } from 'lucide-react';
import { useCardStore } from '@/store';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/core', label: '核心考点', icon: BookOpen },
  { path: '/projects', label: '项目复盘', icon: Briefcase },
  { path: '/algorithms', label: '刷题', icon: Code },
  { path: '/favorites', label: '收藏', icon: Heart },
];

export function Header() {
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);
  const { lastVisitedCoreChapter, lastVisitedProject, lastVisitedAlgorithm } = useCardStore();

  // 检测从 Core/Projects/Algorithms 详情页离开时设置标记
  useEffect(() => {
    const prev = prevLocationRef.current;
    const current = location.pathname;

    // 从 core 详情页离开
    if (prev.startsWith('/core/') && !current.startsWith('/core/')) {
      sessionStorage.setItem('from_core_detail', lastVisitedCoreChapter || 'true');
    }
    // 从 projects 详情页离开
    if (prev.startsWith('/projects/') && !current.startsWith('/projects/')) {
      sessionStorage.setItem('from_project_detail', lastVisitedProject || 'true');
    }
    // 从 algorithms 详情页离开
    if (prev.startsWith('/algorithms/') && !current.startsWith('/algorithms/')) {
      sessionStorage.setItem('from_algorithm_detail', lastVisitedAlgorithm || 'true');
    }

    prevLocationRef.current = current;
  }, [location.pathname, lastVisitedCoreChapter, lastVisitedProject, lastVisitedAlgorithm]);

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
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
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === item.path ||
                      (item.path !== '/' && location.pathname.startsWith(item.path))
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 番茄钟 */}
            <Pomodoro />
          </div>
        </div>
      </header>

      {/* 移动端底部导航栏 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
