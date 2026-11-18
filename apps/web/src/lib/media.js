import legacyMedia from './legacyMedia.json' with { type: 'json' };

const uploadBase = (import.meta.env?.VITE_ITEM_PATH || '/uploads').replace(/\/+$/, '');

// One resolver for CMS paths, including older records cached with /uploads.
export function resolveMediaUrl(value, base = uploadBase) {
  const source = typeof value === 'string' ? value.trim().replace(/\\/g, '/') : '';
  if (!source) return '';
  if (/^(https?:|data:|blob:|\/\/)/i.test(source)) return source;
  if (/^\/(static|images)\//i.test(source)) return source;
  const relative = source.replace(/^\/+/, '').replace(/^(backend\/)?uploads\//i, '');
  return legacyMedia[`/${relative}`] || `${base.replace(/\/+$/, '')}/${relative}`;
}

export function mediaFallback(event) {
  const image = event.currentTarget;
  if (image.dataset.fallback) return;
  image.dataset.fallback = 'true';
  image.src = '/static/media-unavailable.svg';
}
