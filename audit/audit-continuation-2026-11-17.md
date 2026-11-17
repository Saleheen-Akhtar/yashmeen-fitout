# Audit continuation: 17 November 2026

Workspace: `C:/Users/sahil/Projects/IT/Dan`. Branch: `codex/p1-launch-blockers`. Work remains local and uncommitted. This pass continues the interrupted audit work and preserves the current public design and business wording.

## Completed

- Refreshed the static inventory using the saved read-only CMS snapshot from 17 November. All 23 retained static assets are referenced; there are zero remaining unverified candidates. Eight unused assets were moved into `.audit-recovery/unused-static-2026-11-17/` in the interrupted pass. Their originals also remain recoverable from Git history. Recovery storage and CMS/migration backups are ignored by Git.
- Finished the disposable MongoDB integration runner and exposed `npm run test:api:integration:local`. It creates its own test database, overrides business MongoDB/auth/media/email/Redis configuration, and stops its child process and database afterward. The suite uses a loopback SMTP receiver with test-only credentials; no business messages are sent.
- Added real database checks for non-mutating reads, nested partial updates, preservation of empty lists, invalid-save rejection, public-field selection, and administrator access to tasks/appointments.
- Added delivered verification/resend/reset email checks, token hashing and replay rejection, password reset revocation of old sessions, registration rollback on SMTP rejection, HTML escaping in lead notifications, and preservation of both enquiry and quote records when notification delivery fails.
- Fixed a build verifier failure reproduced with actual CMS content: it scanned hydration JSON for loading text, so the saved `loading_articles` copy caused fully rendered project pages to fail. CMS detail verification now examines visible main content. Regression fixtures confirm that genuine visible loading states and hidden streaming replacements still fail.
- Reviewed the interrupted pass's migration dry-run reports: 260 media values are ready, zero are missing, and one empty value is skipped. The initial reports identified one readable published blog post for sanitization and two legacy accounts for the verification migration.
- Applied the reviewed account-verification and blog-sanitization migrations with fresh backups. Two legacy administrator records were marked verified, and the one unsafe published blog embed was sanitized without unpublishing the readable post. A follow-up read-only audit reports zero legacy accounts, zero posts needing sanitation and zero published unreadable posts. The Cloudinary media migration was deliberately left unapplied.

## Verification

- 58 frontend tests, 14 API unit tests and 47 API integration tests pass: 119 total.
- ESLint, TypeScript, design locks and syntax checks of the new API scripts/test module pass.
- A full build using the saved read-only CMS snapshot passes: 44 completed pages, 39 sitemap URLs, 21 projects and one published blog post. The snapshot is an observed CMS state, not a replacement for a configured deployment build API.
- The normal default build is restored after snapshot verification: 22 completed pages and 17 sitemap URLs.
- The existing CKEditor chunk-size warning remains. Its chunk is lazy and admin-only; deployed loading performance still needs measurement.
- Windows sandbox restrictions blocked Node test workers and `mongod` process creation. The same test commands passed with normal process access.
- No visitor UI or CSS was changed during this continuation. Responsive/browser interaction evidence from the 16 November report remains the prior UI verification; it was not repeated or claimed as a new live production check.

## Remaining work and prerequisites

| Item | Current evidence and next step |
| --- | --- |
| Deployment | The repaired application is still local. Choose/confirm the deployment project and root, configure its environment, then verify preview/production routing, canonical/robots/sitemap, fonts/images, crawler-visible CMS pages and distributed limits. The older-domain observation in the 16 November report was not refreshed here. |
| Production services | The read-only report lists missing `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and `CLIENT_URL`. Supply the real service configuration; do not substitute test values for launch. |
| Build CMS configuration | Supply the public API base as `SITEMAP_API_URL` and confirm `VITE_SITE_URL` at deployment. The successful snapshot build establishes renderer coverage, not live build API availability. |
| Media migration | Account verification and blog sanitation are complete. Review the saved media reports/backups before applying the media script with `--apply`; Cloudinary migration requires its missing credentials and remains intentionally deferred. |
| Real email and uploads | Verify provider delivery and durable Cloudinary upload/retrieval in the chosen environment. Captured local SMTP messages establish application behavior, not real inbox deliverability. |
| Business/off-site checks | Preserve existing wording as requested. Verify facts/image rights before changing or publishing claims; review media alt text, measure deployed Core Web Vitals and complete Search Console/Bing/Business Profile work. |

The local database, notification, account/blog migration and asset-reference gaps are closed. Production Cloudinary/Upstash configuration, Cloudinary media migration and deployment remain open.
