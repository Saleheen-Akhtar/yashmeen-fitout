export const CACHE_KEYS = {
  PROJECTS: "photogallery:data:v5",
  GALLERY: "photogallery:data:v2",
  PROJECT_DETAIL_PREFIX: "projectdetails:v1:",
  VACANCIES: "career:vacancies:v1",
  VIDEOS: "videogallery:data:v1",
  POSTS_PREFIX: "posts:latest:",
};

const listeners = new Set();

export function subscribeCacheInvalidation(listener) {
  if (typeof listener !== "function") return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitInvalidation(scope, id) {
  listeners.forEach((fn) => {
    try {
      fn(scope, id);
    } catch {
      /* ignore */
    }
  });
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function safeRemoveByPrefix(prefix) {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export function clearProjectsCache() {
  safeRemove(CACHE_KEYS.PROJECTS);
  ["photogallery:data:v1", "photogallery:data:v3", "photogallery:data:v4"].forEach(safeRemove);
  emitInvalidation("projects");
}

export function clearGalleryCache() {
  safeRemove(CACHE_KEYS.GALLERY);
  safeRemove(CACHE_KEYS.PROJECTS);
  ["photogallery:data:v1", "photogallery:data:v3", "photogallery:data:v4"].forEach(safeRemove);
  emitInvalidation("gallery");
}

export function clearProjectDetailsCache(id) {
  if (id !== undefined && id !== null) {
    safeRemove(`${CACHE_KEYS.PROJECT_DETAIL_PREFIX}${String(id)}`);
  } else {
    safeRemoveByPrefix(CACHE_KEYS.PROJECT_DETAIL_PREFIX);
  }
  emitInvalidation("project-details", id);
}

export function clearVacancyCache() {
  safeRemove(CACHE_KEYS.VACANCIES);
  emitInvalidation("vacancies");
}

export function clearVideoGalleryCache() {
  safeRemove(CACHE_KEYS.VIDEOS);
  emitInvalidation("videos");
}

export function clearPostsCache() {
  safeRemoveByPrefix(CACHE_KEYS.POSTS_PREFIX);
  emitInvalidation("posts");
}

export function clearAllPublicCaches() {
  clearProjectsCache();
  clearGalleryCache();
  clearProjectDetailsCache();
  clearVacancyCache();
  clearVideoGalleryCache();
  clearPostsCache();
}
