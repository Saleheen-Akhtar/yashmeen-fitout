# Can AI agents reach and read the Yashmeen website?

Live audit: 14 November 2026. Origin: https://yashmeen-fitout.vercel.app.

**Yes, the sampled public pages are reachable. Browser agents can read substantial content after JavaScript and API requests finish. Full content is not reliably available to plain HTTP readers or readers that extract too early.**

This report addresses website access and content extraction. Application sources, deployment settings and CMS records were not changed.

## Live evidence

| Check | Observed result | Meaning |
| --- | --- | --- |
| Homepage, Interior Design, robots.txt and sitemap.xml | HTTP 200 | These public resources are accessible from this audit environment. |
| Homepage requests identifying as GPTBot, OAI-SearchBot and ClaudeBot | HTTP 200; no X-Robots-Tag | These user-agent probes were allowed. This does not prove actual provider crawlers can access, have indexed or will cite the site. |
| robots.txt | Allows public pages; disallows dashboard, login, forgot-password and /api/ | Public content is not excluded by the checked robots rules. API JSON is not an appropriate substitute for crawlable page content. |
| Homepage without JavaScript | 83 visible words, 9 links; empty root | A short fallback company summary and navigation are available. Full homepage content is absent. |
| Homepage with JavaScript | 765 visible words, 46 links | Company description, services, process, project names, testimonial and contact content can be read by a browser. |
| Interior Design without JavaScript | 84 visible words, 9 links; empty root | Only the fallback summary and navigation are readable. |
| Interior Design with JavaScript | 616 visible words, 41 links | Substantial service content becomes readable. Closed accordion answers may require interaction. |
| Jina Reader homepage extraction | Substantial text, but still “Loading projects…” and some sections omitted | A rendering/extraction service can recover more text, but its returned snapshot was incomplete. |
| Live sitemap | 18 URLs; no project-detail or blog-detail URLs; includes /experience | Discovery coverage is incomplete and differs from the current local sitemap. |
| Live public CMS API | 21 projects and 1 active post, both endpoints HTTP 200 | Dynamic records exist, despite their absence from the sitemap. |

Word counts describe the sampled browser's visible body text, including navigation/footer, rather than unique editorial copy. Analytics and Google Maps requests were blocked in browser probes; the main site scripts and content APIs were allowed.

## Findings

### 1. P2: full page content is missing from initial HTML

The raw homepage response is 4,985 bytes and the Interior Design response is 4,235 bytes. Both contain an empty div#root, metadata and a short noscript summary. They do not contain the actual rendered services, process, projects, testimonial or complete page body.

The source explains this: apps/web/scripts/prerender.mjs modifies metadata and appends a generic noscript block, leaving the React root empty. Its comment claiming agents can read the complete website without JavaScript is not supported by the live responses. The service page does receive route-specific initial metadata, so the issue is missing body content, rather than all routes receiving identical HTML.

Fix: produce real server-rendered or statically rendered route content, including actual CMS content for detail pages. Keep essential headings, copy and internal links present in the initial response. Confirm served HTML matches the browser content.

### 2. P2: project content depends on a reader waiting for API data

Sample: https://yashmeen-fitout.vercel.app/project/details/6ae711474b8ab8482d43b459.

An early browser snapshot showed “Loading project…”. A second probe with an additional 12-second wait after navigation rendered **Luxury Kitchen Design**, size 250, Business bay Dubai, Design & Build, a sector value and the showcase link. Its project API returned HTTP 200. This page eventually works; the early snapshot does not establish a permanent failure or measure an exact load time.

Its raw HTTP response still has an empty root and the generic homepage title. The browser changes the title to “Luxury Kitchen Design | Yashmeen Fit-Out Dubai” after loading. Plain readers miss the project-specific content and title, while rendering readers can capture a loading placeholder if they stop too soon. The sampled case study also has little descriptive text beyond its fields and media showcase.

Fix: serve project-specific HTML and metadata before JavaScript. Add useful, verified case-study text describing the brief, scope and result. Keep animation independent of essential text visibility.

### 3. P2: the sampled published blog does not provide a readable article

Sample: https://yashmeen-fitout.vercel.app/blog/details/6acfbe7941ea373e8d5c4bcb.

After the longer wait, the page still displayed “Our Blog”, a date, “1 min read” and literal HTML/script embed code referencing app.trysoro.com. It did not display substantive article text. The post API returned HTTP 200, so this is not simply an inaccessible endpoint. Its initial HTML also contains the generic homepage title and an empty root.

Fix: publish actual article content in the page body, with a meaningful title and description. Treat any embed as an enhancement, and safely handle rich HTML. This finding concerns the one sampled live post; it does not assert that all future posts fail.

### 4. P2: sitemap coverage omits available CMS details

The deployed sitemap lists 18 URLs, including the removed experience route, and no project or blog details. The current local file lists 17 static URLs and omits experience. Deployment artifacts therefore differ from this checkout; deployed source revision and settings were not established.

apps/web/scripts/generate-seo-files.mjs adds CMS detail URLs only when SITEMAP_API_URL is supplied and API reads succeed. A build otherwise continues with static URLs. Missing sitemap entries do not make pages unreachable, but reduce direct discovery support.

Fix: configure and verify CMS sitemap generation in the active deployment. Include published detail URLs, remove stale URLs, and keep internal links crawlable. Adding an optional machine-readable summary file alone would not repair the missing page bodies.

## Recommended order

1. Render actual static and CMS page content into initial HTML, with route-specific metadata.
2. Replace the live blog's literal embed code with a readable article.
3. Include published projects/posts in the deployed sitemap and remove stale entries.
4. Verify raw HTTP, JavaScript-disabled and rendered extraction after deployment, including detail pages and loading states.

Reachability passes for the sampled routes. Browser readability is substantial but timing-sensitive. Reliable full-content readability across agent types remains incomplete. Indexing, ranking and citation by AI providers were not verified.

## Evidence

- [Bot probes, API counts and browser text](./public-agent-readability.json)
- [Longer project/blog detail verification](./public-detail-readability.json)
- [Raw homepage HTML](./crawl-home.html), [headers](./crawl-home-headers.txt)
- [Raw service HTML](./crawl-service.html), [headers](./crawl-service-headers.txt)
- [Deployed robots rules](./crawl-robots.txt), [deployed sitemap](./crawl-sitemap.xml)
- [Reader extraction](./crawl-reader.txt)
- Reproduction scripts: public-agent-readability.mjs, public-detail-readability.mjs and fetch-public-crawl.ps1.
