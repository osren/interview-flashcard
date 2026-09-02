export const AI_QUOTA_ADMIN_EMAIL = '1529924810@qq.com';

export function isAiQuotaAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AI_QUOTA_ADMIN_EMAIL.toLowerCase();
}
