import { StrictMode } from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { AppContent } from "./App.jsx";

export async function render(url, prerenderData = {}) {
  globalThis.__YASHMEEN_PRERENDER__ = prerenderData;
  try {
    let renderError;
    const tree = <StrictMode><StaticRouter location={url}><AppContent /></StaticRouter></StrictMode>;
    // Resolve lazy modules first. The completed second pass emits their content in
    // place, without streaming replacement scripts or hidden Suspense segments.
    const { prelude } = await prerenderToNodeStream(
      tree,
      {
        onError(error) { renderError = error; },
      },
    );
    for await (const chunk of prelude) { void chunk; }
    if (renderError) throw renderError;
    return renderToString(tree);
  } finally {
    delete globalThis.__YASHMEEN_PRERENDER__;
  }
}
