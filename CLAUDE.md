# מצב השוק ואני — project notes for Claude

Read this first when continuing work on this project. Reply to the owner in Hebrew (masculine address), in plain non-technical language.

## What this is
A daily evening market briefing in Hebrew for beginners, published as a static website:
**https://skirat-shvakim.github.io** (GitHub Pages, branch `main`, repo root). The owner and his friends add it to their iPhone home screens.

## How it runs
- A scheduled task in the owner's Claude account, **"מצב השוק ואני – סקירה יומית"** (trigger id `trig_01PjbmXSTaAUDXMwRDEjRQjE`, created 18.11.2026 from the chat that has this repo authorized; the older task `trig_01YPxYuGW5B737yY1GbFVKyh` is disabled), runs Sun–Thu (cron `CRON_TZ=Asia/Jerusalem 14 18 * * 1-5`, i.e. Mon–Fri UTC-calendar days = Israeli trading days) at 18:14 Israel time.
- Each run: researches the web → writes the briefing → takes the current `index.html` in this repo as the template → replaces content + script data → `node --check` → commits and pushes to `main` → sends the owner a push notification.
- If pushing fails, it publishes the page as a Claude artifact instead and reports the exact error.
- A watchdog task (email if the site was not updated) was created and then cancelled at the owner's request (18.11.2026): Claude notifications can only email the account address. The owner checks the "עודכן" date in the footer and the daily push notification instead.
- To change what the agent does, edit the scheduled task's prompt (`update_trigger`). To change the design, edit `index.html` here — the agent copies whatever design is live.

## Page structure (`index.html`, single self-contained file)
- Design: "metro line" — a thick coloured route down the side; each section is a station (`.route [data-nav]::before/::after`). Fonts: Secular One (headings) + Heebo. White ground; line colours blue/amber/red/green/teal. Dark mode via `light-dark()`.
- Sticky header: logo + "מצב השוק ואני" + date + menu button. Side menu (drawer on phone, fixed sidebar ≥1180px) is generated from every element with `data-nav` (keep ids/data-nav when editing).
- Sections (ids): `hero` (headline, subtitle, mood chip, 3 numbered bullets) · `me` (מה זה אומר עליי) · `numbers` (6 tiles with context tags + "עוד נתונים, למתקדמים") · `stocks` (המניות שלי) · `story` · `geo` · `think` (incl. "מה אם כולם טועים?") · `word` (מונח היום) · `faqs` (prepared Q&A accordion) · `tomorrow` · `sources`.
- Script data filled daily: `STOCKS` (20 tickers: NVDA AAPL MSFT TSLA AMZN GOOGL META AVGO AMD NFLX PLTR JPM V KO TEVA CHKP NICE WIX MBLY ESLT; `price:null` = no data today), `STOCK_NOTE`, `GLOSSARY` (tappable terms `<button class="term" data-t="key">`), `FAQ`.
- Stock chooser: each reader picks up to 6 tickers, saved in localStorage (`mine`, `pick`).
- Visitor counter: GoatCounter script before </body> (`https://adamandrachel.goatcounter.com/count`) — must stay on every edition. Dashboard: https://adamandrachel.goatcounter.com
- Footer must keep: disclaimer "הסקירה היא סיכום מידע וניתוח בלבד ואינה מהווה ייעוץ השקעות." + "קרדיט: אדם שימקייביץ" + update time.

## Owner's preferences so far
- Concise writing (hard length limits are in the task prompt) — people read fast.
- Simple language for beginners; every professional term explained; no buy/sell advice.
- Gentle, non-shouting colours; distinctive design (not the generic look).
- No TA-35 tile; no "previous editions" section; Q&A prepared in advance (no live chat box on the site).
- Ideas offered but not yet done: weekly Friday summary, intraday alerts on big moves, "what changed since yesterday" line, email to friends, TradingView live widget for any ticker.
- Next steps discussed (16.11.2026): (1) visitor counting — DONE 18.11 (GoatCounter); (2) web push notifications for home-screen readers (needs an external push service); (3) later, app-store versions — Google Play via a PWA wrapper (~$25 one-time), Apple App Store needs real native value such as notifications/widget (~$99/year, needs a Mac).

## Working notes
- Push with `git -c push.negotiate=true push origin HEAD:main`. Repository settings (rename, Pages) can't be changed through the proxy — the owner does those in GitHub's UI.
- Runs on 16–18.11.2026 could not push: "access denied by the git proxy: ... not in this session's authorized repository set (HTTP 403)". A scheduled task only gets the repos authorized in the chat that CREATED it, and a scheduled run cannot add repos itself. Fix: the task was recreated (18.11) from a chat where this repo is attached — confirmed working: the 18.11 manual run pushed successfully. If this repeats, recreate the task from a chat that has the repo attached with push access.
