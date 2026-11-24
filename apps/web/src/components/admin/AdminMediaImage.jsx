import { useEffect, useState } from "react";

const DEFAULT_FALLBACK = "/static/media-unavailable.svg";

const shouldPreflight = (value) => {
  if (!value || typeof window === "undefined") return false;
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin && url.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
};

export default function AdminMediaImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  onError,
  ...props
}) {
  const [preflightResult, setPreflightResult] = useState({ source: "", resolved: "" });
  const [failedSource, setFailedSource] = useState("");
  const needsPreflight = shouldPreflight(src);
  const resolvedSrc = !src || failedSource === src
    ? fallbackSrc
    : needsPreflight
      ? preflightResult.source === src
        ? preflightResult.resolved
        : fallbackSrc
      : src;

  useEffect(() => {
    let active = true;

    if (!src || !shouldPreflight(src)) return undefined;

    fetch(src, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        if (active) {
          setPreflightResult({
            source: src,
            resolved: response.ok ? src : fallbackSrc,
          });
        }
      })
      .catch(() => {
        if (active) setPreflightResult({ source: src, resolved: fallbackSrc });
      });

    return () => {
      active = false;
    };
  }, [fallbackSrc, src]);

  const handleError = (event) => {
    if (src) setFailedSource(src);
    onError?.(event);
  };

  return <img {...props} src={resolvedSrc} onError={handleError} />;
}
