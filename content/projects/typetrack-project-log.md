# TypeTrack

## Properties

| | |
|---|---|
| **title** | Empty |
| **date** | 📅 16-07-2026 |
| **tags** | Empty |
| **status** | active |
| **links** | `manifest-v3` `content-script-injection` `wpm-calculation` |
| **bottleneck** | Reliably attaching to text fields across shadow DOM, dynamically-loaded SPA content, and same-origin iframes — without adding noticeable input lag. |
| **milestone** | Working content script on Gmail, Notion, and X as a compatibility proof-of-concept before wider testing. |
| **summary** | A privacy-first browser extension that tracks real-time typing speed across every text field on the web, so people can see gradual progress they'd otherwise never notice. |

---

## Idea & Inspiration
Typing speed improves constantly but invisibly — nobody sits down to deliberately practice it, yet everyone gets faster over months of ordinary use. That progress happens in the background of everyday typing and is easy to lose track of entirely. TypeTrack aims to surface it in real time, everywhere someone types, rather than confining measurement to a single dedicated typing-test page like most existing tools.

## Research
Before writing any code, I looked at how existing typing-speed tools handle measurement and where they fall short:
- Most WPM trackers only work inside a purpose-built test page, not on live sites people actually use.
- A live number needs a short rolling window (5–10s) rather than a full-session average, or it feels sluggish and stops reflecting the current moment.
- Modern SPAs (Gmail, X, Notion) inject their text fields after the page loads, so `<all_urls>` content scripts alone aren't enough — a `MutationObserver` is required to catch fields as they appear.
- Privacy is the single biggest adoption risk for a tool that listens to keystrokes across the whole web, so the design only ever stores counts, timestamps, and word boundaries — never the typed text itself.

## Design
The system has three parts:

- **Content script** — attaches listeners to every `input`, `textarea`, and `contenteditable` element on the page, walks into open shadow roots, and re-scans on DOM mutation to catch dynamically loaded fields. Renders the floating badge showing live WPM alongside the all-time personal best.
- **Background service worker** — aggregates finished sessions into daily/weekly/monthly rollups via `chrome.alarms`, and keeps a single always-current `allTimeBestWPM` value so the badge never has to recompute it from history.
- **Popup dashboard** — a Chart.js trend line over 7/30/90 days, streaks, and week-over-week / month-over-month comparisons, built around surfacing the "you're X% faster than a month ago" moment.
