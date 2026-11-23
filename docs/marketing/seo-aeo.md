# SEO and answer-engine work

## 2026-11-04

- Audited all 165 production sitemap URLs, sampled priority content and reviewed authenticated Google Search Console/DataFast reports.
- Recorded a 6.6/10 baseline and evidence-based criteria for 10 in the [audit](seo-aeo-audit-2026-11-04.md).
- Added complete standalone-page/docs prerendering, canonical redirects, real 404s, server-side private-route noindex, honest dates and build/HTTP regression gates.
- Removed duplicate article H1s and stale software assertions; restored viewport zoom; corrected docs breadcrumb destinations.
- Fixed a measured mobile font-swap layout shift by self-hosting and preloading the existing Geist font, with its license.
- Reworked the existing routine guide with direct answers, primary research, visible FAQs and real media. Kept its URL and original publication date.
- Google sitemap was already submitted and successful, last read 3 November, with 165 discovered URLs. No duplicate submission was needed.
- Kept private analytics outside the public repository and preserved unrelated work in the original checkout.
- Implementation validation and deployment status: see [project status](../STATUS.md). Performance, Bing coverage, independent authority and controlled AI citation rates remain open measurement work.

## 2026-11-23

- Shipped three new posts aimed at questions where ChatGPT never names Open Sunsama: /blog/sunsama-api ("Does Sunsama have an API?"), /blog/reclaim-ai-vs-sunsama ("Reclaim.ai vs Sunsama") and /blog/super-productivity-vs-vikunja ("Super Productivity vs Vikunja"), each with a code-rendered cover from real screenshots.
- Refreshed six posts with facts re-checked on 23 November 2026: best-daily-planner-apps, best-productivity-apps-adhd, reclaim-ai-vs-motion-vs-sunsama, best-open-source-kanban-boards, open-source-todoist-alternatives and best-open-source-productivity-apps, plus best-open-source-focus-apps for the Super Productivity MCP fact.
- Corrected facts: Sunsama's Autoplan (beta) now drafts the day; Super Productivity has a local MCP endpoint since v19.3.0; Vikunja's MCP server shipped in v2.7.0; mcp-sunsama is archived; Routine's public API is still "soon"; Open Sunsama has an early mobile app (Android APK, iOS TestFlight).
- Refreshed stars and releases for all 51 apps in oss-apps.json and pinged IndexNow for every changed URL.
- Fixed stale facts site-wide in one change. The MCP tool count is now 47 everywhere (was 24), which is what `tools/list` returns on the hosted `/mcp` endpoint; the docs, README and /features/ai-integration list all 23 Ideas tools. Sunsama facts now say it has an official MCP server (OAuth, out of beta since August 2026), no public REST API, a Linux app, and Autoplan, a beta agent that drafts the day for review without re-planning when meetings move. Every page describes the phone app as an early Android APK and iOS TestFlight build, llms.txt included. Price-led pitches ("free forever", "save $240/year", cost tables) are gone from every post this change touched.
- Removed every remaining price pitch for Open Sunsama from 91 older blog posts: "free forever" and "$0" table cells, "Completely Free" sections, "best free X" titles and H1s, "save $240/year" cost tables, "no credit card" CTAs and "Try it free" links. Those spots now lead with time blocking, the kanban board, focus mode, calendar sync, open source and self-hosting, and AI agents over MCP. Competitor prices and free-plan facts stay. Internal links to /free-time-blocking-app now point to /features/time-blocking; the old URL still redirects, and no slug changed.
