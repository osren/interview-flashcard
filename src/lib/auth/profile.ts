import { supabase } from '@/lib/supabase/client';

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return { url: null, error: '仅支持 JPG、PNG、WebP、GIF 格式' };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { url: null, error: '头像不能超过 2MB' };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    const message = /bucket not found/i.test(uploadError.message)
      ? '头像存储桶 avatars 尚未创建。请在 Supabase → SQL Editor 执行 supabase/migrations/20260818000000_avatars_storage.sql，或到 Storage 新建名为 avatars 的 Public bucket。'
      : uploadError.message;
    return { url: null, error: message };
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
