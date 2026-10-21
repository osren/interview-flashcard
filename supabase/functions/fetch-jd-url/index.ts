import { corsHeaders, jsonResponse, requireUser } from '../_shared/auth.ts';

const MAX_BYTES = 500 * 1024;
const TIMEOUT_MS = 8000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local')) return true;
  if (host === '0.0.0.0' || host === '::1') return true;
  if (/^10\./.test(host) || /^192\.168\./.test(host) || /^127\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

function extractText(html: string): string {
  const cleaned = stripTags(html);
  const article = cleaned.match(/<article[\s\S]*?<\/article>/i)?.[0]
    ?? cleaned.match(/<main[\s\S]*?<\/main>/i)?.[0]
    ?? cleaned;
  return article
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const auth = await requireUser(req);
  if (auth.error) return auth.error;

  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url || typeof url !== 'string') {
      return jsonResponse({ ok: false, error: 'url is required', fallback: 'paste' }, 400);
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return jsonResponse({ ok: false, error: 'Invalid URL', fallback: 'paste' }, 400);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return jsonResponse({ ok: false, error: 'Only http(s) URLs are allowed', fallback: 'paste' }, 400);
    }
    if (isBlockedHost(parsed.hostname)) {
      return jsonResponse({ ok: false, error: 'URL host is not allowed', fallback: 'paste' }, 400);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const upstream = await fetch(parsed.toString(), {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!upstream.ok) {
      return jsonResponse({
        ok: false,
        error: `Fetch failed (${upstream.status})`,
        fallback: 'paste',
      });
    }

    const buffer = await upstream.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return jsonResponse({ ok: false, error: 'Page too large', fallback: 'paste' });
    }

    const html = new TextDecoder().decode(buffer);
    const text = extractText(html);
    if (text.length < 40) {
      return jsonResponse({ ok: false, error: 'Could not extract JD text', fallback: 'paste' });
    }

    return jsonResponse({ ok: true, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch failed';
    return jsonResponse({ ok: false, error: message, fallback: 'paste' });
  }
});
