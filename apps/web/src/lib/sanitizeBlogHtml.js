import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p", "br", "hr", "h2", "h3", "h4", "strong", "em", "u", "s",
  "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td", "span",
];

const ALLOWED_ATTR = ["href", "title", "target", "rel", "src", "alt", "width", "height", "class"];

const sanitizeWithoutDom = (value) => String(value)
  .replace(/<\s*(?:script|style|iframe|object|embed|oembed|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*(?:script|style|iframe|object|embed|oembed|svg|math)\s*>/gi, "")
  .replace(/<\/?(?:script|style|iframe|object|embed|oembed|svg|math)\b[^>]*>/gi, "")
  .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
  .replace(/\s+(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript):[\s\S]*?\2/gi, "");

export const sanitizeBlogHtml = (value = "") => {
  if (typeof DOMPurify?.sanitize !== "function") return sanitizeWithoutDom(value);
  return DOMPurify.sanitize(String(value), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
};
