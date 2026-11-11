import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_OG_IMAGE,
  HOME_JSON_LD,
  SITE_NAME,
  SITE_URL,
  getRouteSeo,
  normalizePathname,
} from "../libs/seoConfig";

function upsertMetaTag(attrName, attrValue, content) {
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLinkTag(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const clean = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${clean}`;
}

export default function SeoHead() {
  const { pathname } = useLocation();
  const [override, setOverride] = useState(null);

  useEffect(() => {
    const onSeoUpdate = (e) => {
      const detail = e?.detail;
      if (!detail) {
        setOverride(null);
        return;
      }
      setOverride({
        pathname: normalizePathname(detail.pathname || window.location.pathname),
        title: detail.title,
        description: detail.description,
        image: detail.image,
        robots: detail.robots,
      });
    };
    window.addEventListener("seo-update", onSeoUpdate);
    return () => window.removeEventListener("seo-update", onSeoUpdate);
  }, []);

  useEffect(() => {
    const cleanPath = normalizePathname(pathname);
    const baseSeo = getRouteSeo(cleanPath);
    const activeOverride =
      override && override.pathname === cleanPath ? override : null;

    const title = activeOverride?.title || baseSeo.title;
    const description = activeOverride?.description || baseSeo.description;
    const robots = activeOverride?.robots || baseSeo.robots || "index, follow";
    const canonicalUrl = `${SITE_URL}${baseSeo.canonicalPath === "/" ? "/" : baseSeo.canonicalPath}`;
    const imageUrl = toAbsoluteUrl(activeOverride?.image || baseSeo.image);

    document.title = title;
    upsertMetaTag("name", "description", description);
    upsertMetaTag("name", "robots", robots);
    upsertLinkTag("canonical", canonicalUrl);

    upsertMetaTag("property", "og:type", "website");
    upsertMetaTag("property", "og:site_name", SITE_NAME);
    upsertMetaTag("property", "og:title", title);
    upsertMetaTag("property", "og:description", description);
    upsertMetaTag("property", "og:url", canonicalUrl);
    upsertMetaTag("property", "og:image", imageUrl);

    upsertMetaTag("name", "twitter:card", "summary_large_image");
    upsertMetaTag("name", "twitter:title", title);
    upsertMetaTag("name", "twitter:description", description);
    upsertMetaTag("name", "twitter:image", imageUrl);

    const ldId = "yashmeen-structured-data";
    let ldEl = document.getElementById(ldId);
    if (cleanPath === "/") {
      if (!ldEl) {
        ldEl = document.createElement("script");
        ldEl.id = ldId;
        ldEl.type = "application/ld+json";
        document.head.appendChild(ldEl);
      }
      ldEl.textContent = JSON.stringify(HOME_JSON_LD);
    } else if (ldEl) {
      ldEl.remove();
    }
  }, [pathname, override]);

  return null;
}
