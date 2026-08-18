export interface UserProfileMetadata {
  username?: string;
  avatar_url?: string;
}

export function parseUserProfile(metadata: Record<string, unknown> | undefined): UserProfileMetadata {
  const username = metadata?.username;
  const avatarUrl = metadata?.avatar_url;

  return {
    username: typeof username === 'string' && username.trim() ? username.trim() : undefined,
    avatar_url: typeof avatarUrl === 'string' && avatarUrl.trim() ? avatarUrl.trim() : undefined,
  };
}

export function getDisplayName(profile: UserProfileMetadata, email?: string | null): string {
  if (profile.username) return profile.username;
  if (email) return email.split('@')[0] ?? '用户';
  return '用户';
}

export function getAvatarInitial(profile: UserProfileMetadata, email?: string | null): string {
  const name = getDisplayName(profile, email);
  return name.slice(0, 1).toUpperCase();
}

export function isProfileComplete(profile: UserProfileMetadata): boolean {
  return Boolean(profile.username && profile.username.length >= 2);
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  if (trimmed.length < 2) return '用户名至少 2 个字符';
  if (trimmed.length > 16) return '用户名最多 16 个字符';
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(trimmed)) {
    return '用户名仅支持中文、字母、数字和下划线';
  }
  return null;
}
