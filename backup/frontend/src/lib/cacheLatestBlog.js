import { useCallback, useEffect, useState } from "react";
// TODO: adjust this path to where your API module lives
import { postAPI, itemPath } from "../services/api";
import { subscribeCacheInvalidation } from "./publicCache";

/* ---------------- helpers ---------------- */

// Works with both `{ data: { data: [...] } }` and `{ data: [...] }` responses
const toList = (res) => {
  const body = res?.data;
  const list = body?.data ?? body;
  return Array.isArray(list) ? list : [];
};

// Absolute / local static URLs are used as-is; stored paths are resolved via itemPath
const fileUrl = (path = "") =>
  /^(https?:|data:|blob:|\/static\/|\/images\/|\/uploads\/)/i.test(path)
    ? path
    : `${itemPath}/${String(path).replace(/^\/+/, "")}`;

const stripHtml = (html = "") =>
  new DOMParser()
    .parseFromString(String(html), "text/html")
    .body.textContent.replace(/\s+/g, " ")
    .trim();

const truncate = (text, n = 130) =>
  text.length > n ? `${text.slice(0, n).trimEnd()}…` : text;

const formatDate = (d) => {
  const date = new Date(d);
  return isNaN(date)
    ? ""
    : date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};

// Post fields: _id, title, pageUrl, file ("/posts/xxx.jpeg"), content (HTML), status, createdAt
// Only the small card fields are kept, so the cache stays tiny (no full HTML content).
const buildCard = (p) => {
  const body = stripHtml(p.content);
  const words = body ? body.split(" ").length : 0;
  return {
    id: p._id,
    title: p.title ?? "",
    excerpt: truncate(body),
    image: p.file ? fileUrl(p.file) : "",
    date: formatDate(p.createdAt),
    readTime: words ? `${Math.max(1, Math.round(words / 200))} min read` : "",
  };
};

/* ---------------- cache layer ---------------- */
// Freshness is decided by the server: GET /post/version returns a number
// that the backend bumps whenever a post is added, edited or deleted.
// If that endpoint is unavailable, we fall back to this time-based cache.
const CACHE_TTL = 10 * 60 * 1000; // 10 min
const cacheKey = (limit) => `posts:latest:${limit ?? "all"}:v1`; // limit = null -> all posts

const memoryCache = {}; // survives route changes, keyed by limit
const inflight = {}; // de-dupes simultaneous full requests
let versionInflight = null; // de-dupes simultaneous version checks

function readCache(limit) {
  const key = cacheKey(limit);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      delete memoryCache[key];
      return null;
    }
    if (memoryCache[key]) return memoryCache[key];
    memoryCache[key] = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return memoryCache[key] ?? null;
}

function writeCache(limit, data) {
  const key = cacheKey(limit);
  memoryCache[key] = { ...data, savedAt: Date.now() };
  try {
    localStorage.setItem(key, JSON.stringify(memoryCache[key]));
  } catch {
    /* ignore */
  }
}

// Call this from your admin panel after a post is added / edited / deleted
export function clearPostsCache() {
  Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
  Object.keys(inflight).forEach((k) => delete inflight[k]);
  versionInflight = null;
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("posts:latest:"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

function getServerVersion() {
  if (!versionInflight) {
    versionInflight = Promise.resolve()
      .then(() => {
        if (typeof postAPI?.getVersion === "function") {
          return postAPI.getVersion();
        }
        return undefined;
      })
      .then((res) => res?.data?.version)
      .catch(() => undefined)
      .finally(() => {
        versionInflight = null;
      });
  }
  return versionInflight;
}

function fetchLatest(limit, version) {
  if (!inflight[limit]) {
    inflight[limit] = (async () => {
      const res = await postAPI.getAll();
      const posts = toList(res)
        .filter((p) => p.status === true) // only active posts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // newest first
        .slice(0, limit ?? undefined) // no limit -> all active posts
        .map(buildCard);
      const data = { posts, version };
      writeCache(limit, data);
      return data;
    })().finally(() => {
      delete inflight[limit];
    });
  }
  return inflight[limit];
}

async function resolveLatestPosts(limit, force = false) {
  const c = force ? null : readCache(limit);
  try {
    const serverVersion = await getServerVersion();

    if (!force && c) {
      const upToDate =
        serverVersion !== undefined
          ? c.version === serverVersion // server says nothing changed
          : Date.now() - c.savedAt < CACHE_TTL; // no version endpoint -> timer
      if (upToDate) return { skipped: true, hadCache: true };
    }

    const data = await fetchLatest(limit, serverVersion);
    return { skipped: false, posts: data.posts, hadCache: !!c };
  } catch (err) {
    err.hadCache = !!c;
    throw err;
  }
}

/* ---------------- hook ---------------- */
// useLatestPosts(3) -> latest 3 active posts, useLatestPosts(null) -> all active posts
export default function useLatestPosts(limit = 3) {
  const [posts, setPosts] = useState(() => readCache(limit)?.posts ?? null);
  const [error, setError] = useState("");

  const startFetch = useCallback(
    (force = false) => {
      let cancelled = false;
      resolveLatestPosts(limit, force)
        .then((res) => {
          if (cancelled || res.skipped) return;
          setPosts(res.posts);
          setError("");
        })
        .catch((err) => {
          console.error("Failed to load posts:", err);
          // if cached posts are already on screen, fail silently
          if (!cancelled && !err?.hadCache) {
            setError(err?.response?.data?.message || "Could not load articles.");
          }
        });

      return () => {
        cancelled = true;
      };
    },
    [limit],
  );

  useEffect(() => {
    let cancel = startFetch(false);

    const handleInvalidate = () => {
      clearPostsCache();
      cancel?.();
      cancel = startFetch(true);
    };

    const unsubscribe = subscribeCacheInvalidation((scope) => {
      if (scope === "posts") handleInvalidate();
    });

    const handleStorage = (e) => {
      if (!e.key || e.key.startsWith("posts:latest:")) {
        handleInvalidate();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      cancel?.();
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [startFetch]);

  return { posts: posts ?? [], loading: posts === null && !error, error };
}
