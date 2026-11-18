import sanitizeHtml from "sanitize-html";

const options = {
    allowedTags: [
        "p", "br", "hr", "h2", "h3", "h4", "strong", "em", "u", "s",
        "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
        "table", "thead", "tbody", "tr", "th", "td", "span",
    ],
    allowedAttributes: {
        a: ["href", "title", "target", "rel"],
        img: ["src", "alt", "title", "width", "height"],
        "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
        a: (tagName, attribs) => ({
            tagName,
            attribs: {
                ...attribs,
                ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
            },
        }),
    },
};

export const sanitizeBlogHtml = (value = "") => sanitizeHtml(String(value), options).trim();

export const blogTextContent = (value = "") =>
    sanitizeHtml(sanitizeBlogHtml(value), { allowedTags: [], allowedAttributes: {} })
        .replace(/\s+/g, " ")
        .trim();
