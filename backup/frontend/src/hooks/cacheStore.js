import { useEffect, useState } from "react";
// TODO: adjust this path to where your API module lives
import { webDetailsAPI } from "../services/api";

/* ---------------- shared cache (Footer + Contact use the same one) ---------------- */
const CACHE_KEY = "webdetails:v1";
// Freshness is decided by the server: GET /web-details/version returns a number
// that the backend bumps whenever web details change.
// If that endpoint is unavailable, we fall back to this time-based cache.
const CACHE_TTL = 10 * 60 * 1000; // 10 min

let memoryCache = null; // survives route changes
let inflight = null; // de-dupes simultaneous full requests
let versionInflight = null; // de-dupes simultaneous version checks

function readCache() {
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) memoryCache = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return memoryCache;
}

function writeCache(data) {
  memoryCache = { ...data, savedAt: Date.now() };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch {
    /* ignore */
  }
}

// Call this from your admin panel after web details are updated
export function clearWebDetailsCache() {
  memoryCache = null;
  inflight = null;
  versionInflight = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

function getServerVersion() {
  if (!versionInflight) {
    versionInflight = Promise.resolve()
      .then(() => {
        if (typeof webDetailsAPI?.getVersion === "function") {
          return webDetailsAPI.getVersion();
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

function fetchDetails(version) {
  if (!inflight) {
    inflight = (async () => {
      const res = await webDetailsAPI.details();
      // supports res, res.data, or res.data.data response shapes
      const payload = res?.data?.data ?? res?.data ?? res;
      const data = { details: payload, version };
      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        writeCache(data);
      } else {
        console.warn("web details: unexpected response shape", res);
      }
      return data;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export default function useWebDetails() {
  const [details, setDetails] = useState(() => readCache()?.details ?? null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const c = readCache();
      try {
        const serverVersion = await getServerVersion();

        if (c) {
          const upToDate =
            serverVersion !== undefined
              ? c.version === serverVersion // server says nothing changed
              : Date.now() - c.savedAt < CACHE_TTL; // no version endpoint -> timer
          if (upToDate) return; // skip the full API call
        }

        const data = await fetchDetails(serverVersion);
        if (!cancelled && data.details) setDetails(data.details);
      } catch (err) {
        console.error("Failed to load web details:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return details;
}
