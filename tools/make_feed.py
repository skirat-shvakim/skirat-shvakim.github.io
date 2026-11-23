#!/usr/bin/env python3
"""Add today's edition to feed.xml (RSS), for RSS-to-email newsletters.

Usage (from the repo root, after index.html is final):  python3 tools/make_feed.py
Reads og:title (the hook), og:description (subtitle), the hero bullets and the
"עודכן: DD.MM.YYYY HH:MM" time from index.html. Re-running on the same day
replaces that day's item. Keeps the latest 30 items.
"""
import html, re, sys, pathlib
from datetime import datetime, timedelta, timezone
from xml.sax.saxutils import escape

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://skirat-shvakim.github.io/"
src = (ROOT / "index.html").read_text(encoding="utf-8")
feed_p = ROOT / "feed.xml"

def meta(prop):
    m = re.search(r'<meta property="%s" content="([^"]*)"' % re.escape(prop), src)
    return html.unescape(m.group(1)) if m else ""

def strip(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s))).strip()

title, desc = meta("og:title"), meta("og:description")
h1 = re.search(r"<h1>(.*?)</h1>", src, re.S)
h1 = strip(h1.group(1)) if h1 else ""
ul = re.search(r'<ul class="bottom">(.*?)</ul>', src, re.S)
bullets = [strip(li) for li in re.findall(r"<li>(.*?)</li>", ul.group(1), re.S)] if ul else []
m = re.search(r"עודכן:\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})", src)
if not (title and m):
    sys.exit("make_feed: missing og:title or 'עודכן' time in index.html")
d, mo, y, hh, mm = map(int, m.groups())
il = timezone(timedelta(hours=3 if 4 <= mo <= 10 else 2))  # approx. Israel DST
when = datetime(y, mo, d, hh, mm, tzinfo=il)
key = "%04d-%02d-%02d" % (y, mo, d)
link = SITE + "?d=%02d%02d" % (d, mo)

body = "<p><b>%s</b></p><p>%s</p>" % (escape(h1), escape(desc))
if bullets:
    body += "<ul>" + "".join("<li>%s</li>" % escape(b) for b in bullets) + "</ul>"
body += '<p><a href="%s">לסקירה המלאה ›</a></p>' % link
body += "<p><small>הסקירה היא סיכום מידע וניתוח בלבד ואינה מהווה ייעוץ השקעות.</small></p>"

item = ("  <item>\n    <title>%s</title>\n    <link>%s</link>\n    <guid isPermaLink=\"false\">bp-%s</guid>\n"
        "    <pubDate>%s</pubDate>\n    <description><![CDATA[%s]]></description>\n  </item>\n") % (
    escape(title), link, key, when.strftime("%a, %d %b %Y %H:%M:%S %z"), body.replace("]]>", "]]&gt;"))

old = feed_p.read_text(encoding="utf-8") if feed_p.exists() else ""
items = [i for i in re.findall(r"  <item>\n.*?  </item>\n", old, re.S) if "bp-%s<" % key not in i]
items = ([item] + items)[:30]

out = ('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n'
       "  <title>בורסה בפיג'מה</title>\n  <link>%s</link>\n"
       '  <atom:link href="%sfeed.xml" rel="self" type="application/rss+xml"/>\n'
       "  <description>סקירת ערב כלכלית קצרה, בעברית פשוטה, למתחילים.</description>\n"
       "  <language>he</language>\n  <lastBuildDate>%s</lastBuildDate>\n%s</channel>\n</rss>\n") % (
    SITE, SITE, when.strftime("%a, %d %b %Y %H:%M:%S %z"), "".join(items))
feed_p.write_text(out, encoding="utf-8")
print("feed.xml: %d items, latest %s — %s" % (len(items), key, title))
