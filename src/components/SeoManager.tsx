import { useLocation } from 'react-router-dom';
import { resolveSeo } from '@/lib/seo';
import { useSeoMeta } from '@/hooks/useSeoMeta';

/**
 * 全局 SEO 入口：监听路由变化，按路径写入页面级 title / description / robots / canonical。
 * 挂载在 AppShell 内，与 Routes 同级。
 */
export function SeoManager() {
  const { pathname } = useLocation();
  const meta = resolveSeo(pathname);
  useSeoMeta(meta, pathname);
  return null;
}
