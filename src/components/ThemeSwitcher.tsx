import { useState, useRef } from 'react';
import { useThemeStore, THEME_CONFIGS, type ThemeColor } from '@/store/useThemeStore';
import { Palette, Check, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colorOptions: { key: ThemeColor; config: typeof THEME_CONFIGS[ThemeColor] }[] = [
  { key: 'blue', config: THEME_CONFIGS.blue },
  { key: 'rose', config: THEME_CONFIGS.rose },
  { key: 'sunset', config: THEME_CONFIGS.sunset },
  { key: 'sapphire', config: THEME_CONFIGS.sapphire },
  { key: 'emerald', config: THEME_CONFIGS.emerald },
  { key: 'slate', config: THEME_CONFIGS.slate },
  { key: 'violet', config: THEME_CONFIGS.violet },
];

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { themeColor, customTheme, setThemeColor, setCustomTheme } = useThemeStore();

  const currentConfig = THEME_CONFIGS[themeColor];

  const handleColorSelect = (color: ThemeColor) => {
    setThemeColor(color);
    setIsOpen(false);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 模拟读取图片主色调（实际可以用 color-thief 等库）
      const reader = new FileReader();
      reader.onload = () => {
        // 这里简化处理，实际项目中可以提取图片主色
        setCustomTheme({
          name: '自定义主题',
          primary: '#6366f1',
          secondary: '#6366f1',
          accent: '#6366f1',
          background: '#ffffff',
          text: '#1f2937',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="切换主题"
      >
        <Palette size={18} />
        <span className="hidden sm:inline">{currentConfig.name}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
          >
            <div className="text-sm font-medium text-gray-700 mb-3">选择主题配色</div>

            {/* 预设主题 */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {colorOptions.map(({ key, config }) => (
                <button
                  key={key}
                  onClick={() => handleColorSelect(key)}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    themeColor === key && !customTheme
                      ? 'bg-gray-100 ring-2 ring-offset-1 ring-primary-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.gradient}`} />
                  <span className="text-xs text-gray-600">{config.name}</span>
                  {themeColor === key && !customTheme && (
                    <Check size={12} className="absolute top-1 right-1 text-primary-600" />
                  )}
                </button>
              ))}
            </div>

            {/* 自定义上传 */}
            <div className="border-t border-gray-100 pt-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Upload size={16} />
                <span>上传图片自定义</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
              />

              {customTheme && (
                <div className="flex items-center justify-between mt-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">自定义主题已应用</span>
                  <button
                    onClick={() => setCustomTheme(null)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}