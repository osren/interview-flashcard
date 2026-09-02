import { FormEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogIn, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { validateUsername } from '@/types/user-profile';
import { useAuth } from './AuthProvider';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function LoginModal({ open, onClose, initialMode = 'signin' }: LoginModalProps) {
  const { configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    const trimmedEmail = email.trim();

    if (mode === 'signup') {
      const usernameError = validateUsername(username);
      if (usernameError) {
        setSubmitting(false);
        setError(usernameError);
        return;
      }
    }

    const result = mode === 'signin'
      ? await signIn(trimmedEmail, password)
      : await signUp(trimmedEmail, password, username.trim());
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setSuccessMessage(
        `注册成功！请前往 ${trimmedEmail} 查收 Supabase 确认邮件，点击链接后再登录。`
      );
      setMode('signin');
      return;
    }

    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          className="w-full max-w-md bg-white rounded-2xl border-2 border-[#e5e5e5] border-b-4 border-b-[#d0d0d0] shadow-xl overflow-hidden"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#e5e5e5] bg-[#f7f7f7]">
            <div>
              <h2 className="text-lg font-extrabold text-[#3c3c3c]">
                {mode === 'signin' ? '登录 InterviewFlash' : '注册账号'}
              </h2>
              <p className="text-xs text-[#777777] mt-0.5">登录后可使用 AI 解释、JD 解析等功能</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#777777] hover:bg-white"
              aria-label="关闭"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {!configured && (
              <div className="rounded-xl border-2 border-[#FFC800] bg-[#fff8dc] px-4 py-3 text-sm text-[#7a5c00] space-y-2">
                <p className="font-bold">本地尚未配置 Supabase，登录功能不可用。</p>
                <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                  <li>
                    复制 <code className="font-mono bg-white/60 px-1 rounded">.env.example</code>{' '}
                    为 <code className="font-mono bg-white/60 px-1 rounded">.env</code>
                  </li>
                  <li>
                    打开{' '}
                    <a
                      href="https://supabase.com/dashboard/project/hrearoyfuozkcrohsome/settings/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold text-[#1CB0F6]"
                    >
                      Supabase API Keys
                    </a>
                    ，复制 Publishable key 或 Legacy anon key
                  </li>
                  <li>
                    写入{' '}
                    <code className="font-mono bg-white/60 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>
                  </li>
                  <li>重启开发服务器（<code className="font-mono">npm run dev</code>）</li>
                </ol>
                <p className="text-xs opacity-80">详细步骤见项目文档 docs/supabase-phase0.md</p>
              </div>
            )}

            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-[#4b4b4b]">邮箱</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 text-[#3c3c3c] outline-none focus:border-[#1CB0F6]"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            {mode === 'signup' && (
              <label className="block space-y-1.5">
                <span className="text-sm font-bold text-[#4b4b4b]">用户名</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 text-[#3c3c3c] outline-none focus:border-[#1CB0F6]"
                  placeholder="2-16 位，中文/字母/数字/下划线"
                  maxLength={16}
                  autoComplete="username"
                />
              </label>
            )}

            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-[#4b4b4b]">密码</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 text-[#3c3c3c] outline-none focus:border-[#1CB0F6]"
                placeholder="至少 6 位"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </label>

            {successMessage && (
              <div className="rounded-xl border-2 border-[#58CC02] bg-[#f0fff0] px-4 py-3 text-sm text-[#2d6a1e]">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="rounded-xl border-2 border-[#FF4B4B] bg-[#fff0f0] px-4 py-3 text-sm text-[#b42318]">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting || !configured}>
              {mode === 'signin' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {submitting ? '处理中...' : mode === 'signin' ? '登录' : '注册'}
            </Button>

            <button
              type="button"
              className="w-full text-sm font-bold text-[#1CB0F6] hover:underline"
              onClick={() => {
                setMode((current) => (current === 'signin' ? 'signup' : 'signin'));
                setError(null);
                setSuccessMessage(null);
              }}
            >
              {mode === 'signin' ? '没有账号？去注册' : '已有账号？去登录'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
