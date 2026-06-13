import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ModuleTileProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  stats?: ReactNode;
  actionLabel?: string;
  accentColor?: string;
  index?: number;
  className?: string;
}

const DUO_COLORS = [
  { bg: '#58CC02', border: '#46A302' },
  { bg: '#1CB0F6', border: '#1899D6' },
  { bg: '#FFC800', border: '#E5B800' },
  { bg: '#CE82FF', border: '#A855F7' },
  { bg: '#FF9600', border: '#E08600' },
  { bg: '#FF4B4B', border: '#EA2B2B' },
];

export function ModuleTile({
  to,
  icon,
  title,
  description,
  stats,
  actionLabel = '开始学习',
  index = 0,
  className,
}: ModuleTileProps) {
  const color = DUO_COLORS[index % DUO_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={className}
    >
      <Link to={to} className="block group h-full">
        <div className="surface-card h-full overflow-hidden">
          <div className="p-5 flex flex-col h-full">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white border-b-4 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: color.bg, borderBottomColor: color.border }}
            >
              {icon}
            </div>
            <h2 className="text-xl font-extrabold text-[#3c3c3c] mb-2 group-hover:text-[#58CC02] transition-colors">
              {title}
            </h2>
            <p className="text-base text-[#777777] leading-relaxed flex-1 font-semibold">
              {description}
            </p>
            {stats && (
              <div className="mt-3 text-base text-[#afafaf] font-bold">
                {stats}
              </div>
            )}
            <div className="mt-4">
              <span
                className="inline-block w-full text-center py-3.5 rounded-xl text-base font-extrabold text-white border-b-4 transition-all group-hover:brightness-105"
                style={{ backgroundColor: color.bg, borderBottomColor: color.border }}
              >
                {actionLabel}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
