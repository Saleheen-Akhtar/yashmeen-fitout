import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useWebsiteContent from '../../hooks/useWebsiteContent';
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  getRobotsDirective,
  getRouteJsonLd,
  getRouteSeo,
  normalizePathname,
} from "../../lib/seoConfig";

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
  const { content } = useWebsiteContent();
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
        structuredData: detail.structuredData,
      });
    };
    window.addEventListener("seo-update", onSeoUpdate);
    return () => window.removeEventListener("seo-update", onSeoUpdate);
  }, []);

  useEffect(() => {
    const cleanPath = normalizePathname(pathname);
    const baseSeo = getRouteSeo(cleanPath, content);
    const activeOverride =
      override && override.pathname === cleanPath ? override : null;

    const title = activeOverride?.title || baseSeo.title;
    const description = activeOverride?.description || baseSeo.description;
    const robots = getRobotsDirective(activeOverride?.robots || baseSeo.robots);
    const canonicalUrl = `${SITE_URL}${baseSeo.canonicalPath === "/" ? "/" : baseSeo.canonicalPath}`;
    const imageUrl = toAbsoluteUrl(activeOverride?.image || baseSeo.image);

    document.title = title;
    upsertMetaTag("name", "description", description);
    upsertMetaTag("name", "robots", robots);
    upsertLinkTag("canonical", canonicalUrl);

    upsertMetaTag("property", "og:type", "website");
    upsertMetaTag("property", "og:site_name", content.legalName || SITE_NAME);
    upsertMetaTag("property", "og:title", title);
    upsertMetaTag("property", "og:description", description);
    upsertMetaTag("property", "og:url", canonicalUrl);
    upsertMetaTag("property", "og:image", imageUrl);

    upsertMetaTag("name", "twitter:card", "summary_large_image");
    upsertMetaTag("name", "twitter:title", title);
    upsertMetaTag("name", "twitter:description", description);
    upsertMetaTag("name", "twitter:image", imageUrl);

    const structuredData = activeOverride && Object.hasOwn(activeOverride, "structuredData")
      ? activeOverride.structuredData
      : getRouteJsonLd(cleanPath, content);
    const ldId = "yashmeen-structured-data";
    let ldEl = document.getElementById(ldId);
    if (structuredData) {
      if (!ldEl) {
        ldEl = document.createElement("script");
        ldEl.id = ldId;
        ldEl.type = "application/ld+json";
        document.head.appendChild(ldEl);
      }
      ldEl.textContent = JSON.stringify(structuredData);
    } else if (ldEl) {
      ldEl.remove();
    }
  }, [pathname, override, content]);

  return null;
}
