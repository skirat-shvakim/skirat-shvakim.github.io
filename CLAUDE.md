# בורסה בפיג'מה (formerly "מצב השוק ואני") — project notes for Claude

Read this first when continuing work on this project. Reply to the owner in Hebrew (masculine address), in plain non-technical language.

## What this is
A daily evening market briefing in Hebrew for beginners, published as a static website:
**https://skirat-shvakim.github.io** (GitHub Pages, branch `main`, repo root). The owner and his friends add it to their iPhone home screens.

## Project board (for the owner)
- Private Claude artifact "בורסה בפיג'מה – לוח הפרויקט" (slug `a1fe337c-8b16-4c87-a569-57d01573c29b`): how the system works (metro-line route), all platforms with links, timeline of events, how to change things, plans. Source copy: /home/claude/hub/index.html in the project chat. UPDATE IT (timeline + 'עודכן לאחרונה') whenever something meaningful changes in the project.

## How it runs
- A scheduled task in the owner's Claude account, **"בורסה בפיג'מה – סקירה יומית"** (trigger id `trig_01PjbmXSTaAUDXMwRDEjRQjE`, created 18.11.2026 from the chat that has this repo authorized; the older task `trig_01YPxYuGW5B737yY1GbFVKyh` is disabled), runs Mon–Fri (ב׳–ו׳; cron `CRON_TZ=Asia/Jerusalem 14 18 * * 1-5`) — the Israeli trading week since Jan 2026 (TASE trades Mon–Fri, Friday is a short session; no Saturday/Sunday runs) at 18:14 Israel time.
- Each run: researches the web → writes the briefing → takes the current `index.html` in this repo as the template → replaces content + script data → `node --check` → commits and pushes to `main` → sends the owner a push notification.
- If pushing fails, it publishes the page as a Claude artifact instead and reports the exact error.
- A watchdog task (email if the site was not updated) was created and then cancelled at the owner's request (18.11.2026): Claude notifications can only email the account address. The owner checks the "עודכן" date in the footer and the daily push notification instead.
- To change what the agent does, edit the scheduled task's prompt (`update_trigger`). To change the design, edit `index.html` here — the agent copies whatever design is live.

## Page structure (`index.html`, single self-contained file)
- Design: "metro line" — a thick coloured route down the side; each section is a station (`.route [data-nav]::before/::after`). Fonts: Secular One (headings) + Heebo. White ground; line colours blue/amber/red/green/teal. Dark mode via `light-dark()`.
- Brand renamed 18.11.2026 to "בורסה בפיג'מה" (logo: night-blue square, crescent moon + metro line). og.png = night-sky share card; bump ?v=N on og.png/icon URLs when they change (WhatsApp caches).
- Sticky header: logo + "בורסה בפיג'מה" + date + menu button. Side menu (drawer on phone, fixed sidebar ≥1180px) is generated from every element with `data-nav` (keep ids/data-nav when editing).
- Layout is SHORT BY DEFAULT (live since 18.11.2026): hero has a reading-time chip "⏱ 30 שניות לעיקר · 3 דקות להכול". Sections with `data-fold` show a one-line `.teaser` and hide `.fold-body` behind a "קרא עוד" button (JS adds it; side-menu click opens the section).
- Sections (ids): `hero` (reading-time chip, mood chip, headline, subtitle, 3 numbered bullets, share button) · `me` (מה זה אומר עליי) · `numbers` (6 tiles + "עוד נתונים, למתקדמים") · `stocks` (המניות שלי) · `story` [fold: teaser sentence; body = story paragraphs + `<h3 class="subh">הזווית הגיאופוליטית</h3>` + `.geo-in` items — geo is merged here, no separate geo section] · `think` ["נקודה למחשבה"; first `.item.teaser` visible, the rest folded] · `word` (מונח היום) · `faqs` [fold; JS puts FAQ[0..1] in #faq and the rest in #faqMore] · `tomorrow` [first <li> in `ul.cal.teaser`, rest folded] · `sources` [teaser "הסקירה מבוססת על N כתבות…", links folded].
- Engagement events sent to GoatCounter (shown as events in the dashboard): time-15s/30s/60s/120s/180s/300s (visible time only), scroll-25/50/75/100, open-<section id>, share, stock-chooser.
- Script data filled daily: `STOCKS` (20 tickers: NVDA AAPL MSFT TSLA AMZN GOOGL META AVGO AMD NFLX PLTR JPM V KO TEVA CHKP NICE WIX MBLY ESLT; `price:null` = no data today), `STOCK_NOTE`, `GLOSSARY` (tappable terms `<button class="term" data-t="key">`), `FAQ`.
- Stock chooser: each reader picks up to 6 tickers, saved in localStorage (`mine`, `pick`).
- Daily HOOK: one punchy line (≤ 9 words, usually a question, e.g. "מה קרה בדוח של אנבידיה?", "למה הדולר זינק היום?") — the most attention-grabbing true fact of the day. It is og:title, the text on the share card, and the first line of the WhatsApp message. Card: `python3 tools/make_og.py "<hook>"` renders og.png (brand BIG on top, hook smaller underneath a thin amber rule; no extra sentences); og:image URL gets ?v=<DDMM>.
- Sharing: Open Graph tags in <head> (og:title = the hook, og:description = subtitle, og:image = /og.png?v=<DDMM>) must be updated daily — WhatsApp previews read them (no JS). `apple-touch-icon.png` = home-screen icon. Share buttons (`[data-share]`, in hero and above the footer) use the native share sheet or wa.me and read the headline at runtime.
- Visitor counter: GoatCounter script before </body> (`https://adamandrachel.goatcounter.com/count`) — must stay on every edition. Dashboard: https://adamandrachel.goatcounter.com
- Footer must keep: disclaimer "הסקירה היא סיכום מידע וניתוח בלבד ואינה מהווה ייעוץ השקעות." + "קרדיט: אדם שימקייביץ" + update time.

## Owner's preferences so far
- Concise writing (hard length limits are in the task prompt) — people read fast.
- Simple language for beginners; every professional term explained; no buy/sell advice.
- Gentle, non-shouting colours; distinctive design (not the generic look).
- No TA-35 tile; no "previous editions" section; Q&A prepared in advance (no live chat box on the site).
- Ideas offered but not yet done: weekly Friday summary, intraday alerts on big moves, "what changed since yesterday" line, email to friends, TradingView live widget for any ticker.
- Next steps discussed (16.11.2026): (1) visitor counting — DONE 18.11 (GoatCounter); (2) web push notifications for home-screen readers (needs an external push service); (3) later, app-store versions — Google Play via a PWA wrapper (~$25 one-time), Apple App Store needs real native value such as notifications/widget (~$99/year, needs a Mac).

## Saved for later (owner said "keep for later", 18.11.2026)
- Distribution plan: send to 10 friends for honest feedback; open a WhatsApp channel "בורסה בפיג'מה" and paste the daily ready message; daily vertical (1080x1920) card for WhatsApp status / Instagram story with the hook + term of the day (could be a second renderer next to tools/make_og.py).
- After ~2 weeks: review GoatCounter numbers → decide on push notifications / app.
- Side-income ideas offered earlier: branded briefing for insurance/pension agents, personalised "מה זה אומר עליי", employer financial-wellness edition, prediction league, audio version, selling the "machine" to other niches.

## Working notes
- Push with `git -c push.negotiate=true push origin HEAD:main`. Repository settings (rename, Pages) can't be changed through the proxy — the owner does those in GitHub's UI.
- Runs on 16–18.11.2026 could not push: "access denied by the git proxy: ... not in this session's authorized repository set (HTTP 403)". A scheduled task only gets the repos authorized in the chat that CREATED it, and a scheduled run cannot add repos itself. Fix: the task was recreated (18.11) from a chat where this repo is attached — confirmed working: the 18.11 manual run pushed successfully. If this repeats, recreate the task from a chat that has the repo attached with push access.
