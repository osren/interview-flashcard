import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Save, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { uploadAvatar } from '@/lib/auth/profile';
import {
  getDisplayName,
  isProfileComplete,
  parseUserProfile,
  validateUsername,
} from '@/types/user-profile';
import { useAuth } from './AuthProvider';
import { UserAvatar } from './UserAvatar';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  required?: boolean;
}

export function ProfileModal({ open, onClose, required = false }: ProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = parseUserProfile(user?.user_metadata);
  const [username, setUsername] = useState(profile.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    const nextProfile = parseUserProfile(user.user_metadata);
    setUsername(nextProfile.username ?? '');
    setAvatarUrl(nextProfile.avatar_url ?? '');
    setAvatarPreview(null);
    setPendingFile(null);
    setError(null);
  }, [open, user]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setPendingFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    setSubmitting(true);
    setError(null);

    let nextAvatarUrl = avatarUrl.trim() || undefined;

    if (pendingFile) {
      const uploadResult = await uploadAvatar(user.id, pendingFile);
      if (uploadResult.error) {
        setSubmitting(false);
        setError(uploadResult.error);
        return;
      }
      nextAvatarUrl = uploadResult.url ?? undefined;
    }

    const result = await updateProfile(username.trim(), nextAvatarUrl);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onClose();
  };

  if (!open || !user) return null;

  const previewName = getDisplayName(parseUserProfile({ username }), user.email);
  const previewAvatar = avatarPreview ?? (avatarUrl || undefined);
  const canClose = !required || isProfileComplete(parseUserProfile(user.user_metadata));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={canClose ? onClose : undefined}
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
                {required ? '完善个人资料' : '编辑资料'}
              </h2>
              <p className="text-xs text-[#777777] mt-0.5">
                {required ? '首次登录请设置用户名和头像' : '更新你的用户名和头像'}
              </p>
            </div>
            {canClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-[#777777] hover:bg-white"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="flex flex-col items-center gap-3">
              <UserAvatar name={previewName} avatarUrl={previewAvatar} size="lg" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-[#1CB0F6] bg-[#f0f9ff] hover:bg-[#e0f2fe]"
              >
                <Camera size={16} />
                上传头像
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-xs text-[#999999]">支持 JPG/PNG/WebP/GIF，最大 2MB</p>
            </div>

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
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-[#4b4b4b]">头像链接（可选）</span>
              <input
                type="url"
                value={avatarUrl}
                onChange={(event) => {
                  setAvatarUrl(event.target.value);
                  setPendingFile(null);
                  if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                  setAvatarPreview(null);
                }}
                className="w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 text-[#3c3c3c] outline-none focus:border-[#1CB0F6]"
                placeholder="https://example.com/avatar.png"
              />
            </label>

            {error && (
              <div className="rounded-xl border-2 border-[#FF4B4B] bg-[#fff0f0] px-4 py-3 text-sm text-[#b42318]">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              <Save size={18} />
              {submitting ? '保存中...' : '保存资料'}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
