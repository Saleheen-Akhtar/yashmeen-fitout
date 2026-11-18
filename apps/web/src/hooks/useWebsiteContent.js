import { useState, useEffect, useCallback } from "react";
import { webDetailsAPI } from "../services/api";
import { clearProjectsCache } from "../lib/publicCache";
import { getPrerenderData } from "../lib/prerenderData";

import { DEFAULT_WEBSITE_CONTENT, mergeWebsiteContent, publicWebsiteContent } from "../../../../shared/siteContent.js";
export { DEFAULT_WEBSITE_CONTENT };

const STORAGE_CACHE_KEY = "yashmeen:webContent:v1";
const CONTENT_TTL = 60 * 1000;

const mergeContent = content => publicWebsiteContent(mergeWebsiteContent(content));

function readInitialContent() {
  const snapshot = getPrerenderData();
  if (Object.hasOwn(snapshot, 'webDetails')) return mergeContent(snapshot.webDetails);
  try {
    const cached = localStorage.getItem(STORAGE_CACHE_KEY);
    if (cached) return mergeContent(JSON.parse(cached));
  } catch {
    /* ignore */
  }
  return mergeContent(DEFAULT_WEBSITE_CONTENT);
}

// Shared module store so multiple mounted components (Header, Hero, Studio, Process, Footer)
// never trigger redundant API calls on mount or window focus.
let sharedContent = readInitialContent();
let inflightRequest = null;
let lastFetchedAt = 0;
let globalListenersAttached = false;
const subscribers = new Set();

function publishContent(next) {
  sharedContent = next;
  subscribers.forEach((fn) => {
    try {
      fn(next);
    } catch {
      /* ignore */
    }
  });
}

async function fetchSharedContent({ force = false } = {}) {
  if (!force && Date.now() - lastFetchedAt < CONTENT_TTL && lastFetchedAt > 0) {
    return sharedContent;
  }
  if (inflightRequest) return inflightRequest;

  inflightRequest = (async () => {
    try {
      const res = await webDetailsAPI.details();
      const raw = res?.data?.data ?? res?.data;
      if (raw && typeof raw === "object") {
        const merged = mergeContent(raw);
        lastFetchedAt = Date.now();
        try {
          localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(merged));
        } catch {
          /* ignore */
        }
        publishContent(merged);
      }
    } catch {
      /* keep cached/default gracefully */
    } finally {
      inflightRequest = null;
    }
    return sharedContent;
  })();

  return inflightRequest;
}

function ensureGlobalListeners() {
  if (globalListenersAttached || typeof window === "undefined") return;
  globalListenersAttached = true;

  window.addEventListener("site-content-updated", (e) => {
    if (e?.detail) {
      lastFetchedAt = Date.now();
      publishContent(mergeContent(e.detail));
    } else {
      fetchSharedContent({ force: true });
    }
  });

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_CACHE_KEY || e.key === "yashmeen:syncPing") {
      fetchSharedContent({ force: true });
    }
  });

  window.addEventListener("focus", () => {
    fetchSharedContent({ force: false });
  });
}

export function notifyWebsiteContentUpdated(newContent) {
  const merged = newContent ? mergeContent(newContent) : null;
  if (merged) {
    lastFetchedAt = Date.now();
    publishContent(merged);
  }
  try {
    if (merged) {
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(merged));
    }
    localStorage.setItem("yashmeen:syncPing", String(Date.now()));
  } catch {
    /* ignore */
  }
  clearProjectsCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("site-content-updated", { detail: merged || newContent }));
  }
}

export default function useWebsiteContent() {
  // The SSR module is reused across routes, but each render has its own CMS snapshot.
  const [content, setContent] = useState(() => typeof window === 'undefined'
    ? mergeContent(getPrerenderData().webDetails)
    : sharedContent);

  const refresh = useCallback(() => fetchSharedContent({ force: true }), []);

  useEffect(() => {
    ensureGlobalListeners();
    subscribers.add(setContent);
    fetchSharedContent({ force: false });
    return () => {
      subscribers.delete(setContent);
    };
  }, []);

  return { content, refresh };
}
