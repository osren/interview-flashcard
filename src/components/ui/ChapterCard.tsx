import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Progress } from './Progress';
import { Badge } from './Badge';

interface ChapterCardProps {
  to: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  cardCount?: number;
  masteredCount?: number;
  progress?: number;
  badges?: ReactNode;
  index?: number;
  actionLabel?: string;
}

const ICON_COLORS = ['#58CC02', '#1CB0F6', '#FFC800', '#CE82FF', '#FF9600'];

export function ChapterCard({
  to,
  title,
  description,
  icon,
  cardCount,
  masteredCount,
  progress,
  badges,
  index = 0,
  actionLabel = '开始',
}: ChapterCardProps) {
  const percentage = progress ?? (cardCount && masteredCount !== undefined
    ? Math.round((masteredCount / cardCount) * 100)
    : 0);
  const iconColor = ICON_COLORS[index % ICON_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link to={to} className="block group">
        <div className="surface-card overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {icon && (
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl text-white font-extrabold border-b-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: iconColor, borderBottomColor: iconColor, filter: 'brightness(0.85)' }}
                  >
                    {icon}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold text-[#3c3c3c] group-hover:text-[#58CC02] transition-colors">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-base text-[#777777] mt-1.5 line-clamp-2 font-semibold">
                      {description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {cardCount !== undefined && (
                      <Badge variant="blue">{cardCount} 张卡片</Badge>
                    )}
                    {masteredCount !== undefined && (
                      <Badge variant={percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'default'}>
                        已掌握 {masteredCount} 张
                      </Badge>
                    )}
                    {badges}
                  </div>
                </div>
              </div>
              <span className="flex-shrink-0 text-[#1CB0F6] font-extrabold text-base group-hover:underline">
                {actionLabel} →
              </span>
            </div>
            {(progress !== undefined || (cardCount && masteredCount !== undefined)) && (
              <div className="mt-4">
                <Progress value={percentage} size="sm" />
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
