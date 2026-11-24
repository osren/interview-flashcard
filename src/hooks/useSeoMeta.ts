import { useEffect } from 'react';
import { SITE_NAME, SITE_LOCALE, absoluteUrl, type SeoMeta } from '@/lib/seo';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * SPA 路由级 SEO：在当前页面挂载 / 切换时同步 title、description、robots、
 * canonical 与 Open Graph / Twitter Card 标签。
 */
export function useSeoMeta(meta: SeoMeta, pathname: string): void {
  useEffect(() => {
    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', meta.noindex ? 'noindex,follow' : 'index,follow');

    const url = absoluteUrl(pathname);
    upsertLink('canonical', url);

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', SITE_LOCALE.replace('-', '_'));
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', url);

    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
  }, [meta.title, meta.description, meta.noindex, pathname]);
}
