/* =====================================================================
   בורסה בפיג'מה — הגדרות הכנסות (חסות, ניוזלטר, תמיכה, "פרסמו אצלנו")
   ---------------------------------------------------------------------
   זה הקובץ היחיד שצריך לערוך כדי להפעיל מסלול הכנסה.
   כל עוד שדה ריק ('') — החלק המתאים לא מוצג באתר בכלל.
   הסוכן היומי לא נוגע בקובץ הזה.
   תצוגה מקדימה של הכול עם נתוני דוגמה:
   https://skirat-shvakim.github.io/?money-preview
   ===================================================================== */
window.BP_MONEY = {

  /* 1) חסות יומית — פס קטן ומסומן "בחסות" אחרי "מה זה אומר עליי".
        from / to בפורמט 2026-12-01 (אפשר להשאיר ריק = תמיד). */
  sponsor: {
    active: false,
    name: '',        // שם החברה
    line: '',        // משפט אחד, עד 12 מילים
    url:  '',        // קישור ללחיצה
    cta:  'לפרטים',
    from: '', to: ''
  },

  /* 2) ניוזלטר — הסקירה במייל.
        אפשרות א: טופס בתוך העמוד — action = כתובת הטופס מהשירות, field = שם שדה המייל.
        אפשרות ב: רק קישור לדף הרשמה של השירות — signupUrl. */
  newsletter: {
    action: '',
    field: 'email',
    hidden: {},      // שדות נסתרים שהשירות דורש, אם יש
    signupUrl: ''
  },

  /* 3) תמיכה מהקוראים — כפתור "הזמינו אותנו לקפה". קישור תשלום (פייבוקס / ביט עסקי / Ko-fi וכו'). */
  support: {
    url: '',
    label: 'הזמינו אותנו לקפה ☕'
  },

  /* 4) "פרסמו אצלנו" — פרטי קשר למפרסמים. הקישור באתר מופיע רק כשיש לפחות פרט קשר אחד. */
  contact: {
    email: '',
    whatsapp: ''     // מספר בפורמט בינלאומי בלי פלוס, למשל 972501234567
  },

  /* נתוני קהל לדף המפרסמים — מעדכנים פעם בחודש מתוך GoatCounter. null = לא מוצג. */
  audience: {
    monthlyVisits: null,
    avgMinutes: null,
    subscribers: null,
    updated: ''      // למשל 'דצמבר 2026'
  },

  /* מחירון לדף המפרסמים. price ריק = "לפי פנייה". */
  packages: [
    { name: 'חסות יומית',  desc: 'פס "בחסות" בסקירה של יום אחד, עם קישור.', price: '' },
    { name: 'חסות שבועית', desc: '5 סקירות יומיות + סיכום השבוע של שבת.',   price: '' },
    { name: 'חסות בניוזלטר', desc: 'שורת חסות במייל היומי לכל המנויים.',      price: '' }
  ]
};

/* ===================== מכאן והלאה: קוד. אין צורך לערוך. ===================== */
(function () {
  var DEMO = {
    sponsor: { active: true, name: 'חברת דוגמה', line: 'כאן יופיע משפט קצר של נותן החסות.', url: '#', cta: 'לפרטים' },
    newsletter: { action: '#', field: 'email', hidden: {}, signupUrl: '' },
    support: { url: '#', label: 'הזמינו אותנו לקפה ☕' },
    contact: { email: 'example@example.com', whatsapp: '' },
    audience: { monthlyVisits: 1200, avgMinutes: 2.5, subscribers: 85, updated: 'נתוני דוגמה' }
  };
  var preview = /money-preview/.test(location.search);
  var M = window.BP_MONEY || {};
  if (preview) for (var k in DEMO) M[k] = Object.assign({}, M[k] || {}, DEMO[k]);
  window.BP_MONEY = M;

  function ev(n) {
    var t = 0;
    (function f() {
      if (window.goatcounter && window.goatcounter.count) { try { window.goatcounter.count({ path: 'ev-' + n, title: n, event: true }); } catch (e) {} }
      else if (t++ < 10) setTimeout(f, 1500);
    })();
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function hasContact() { return !!(M.contact && (M.contact.email || M.contact.whatsapp)); }
  window.BP_MONEY_UTIL = { esc: esc, ev: ev, hasContact: hasContact };

  function run() {
    /* חסות */
    var s = M.sponsor || {}, slot = document.getElementById('sponsorSlot');
    var inRange = (!s.from || today() >= s.from) && (!s.to || today() <= s.to);
    if (slot && s.active && s.name && inRange) {
      slot.innerHTML = '<span class="spl">בחסות</span><p><b>' + esc(s.name) + '</b> · ' + esc(s.line) + '</p>' +
        (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="sponsored noopener">' + esc(s.cta || 'לפרטים') + ' ›</a>' : '');
      slot.hidden = false;
      var a = slot.querySelector('a'); if (a) a.addEventListener('click', function () { ev('sponsor-click'); });
      ev('sponsor-view');
    }

    /* ניוזלטר + תמיכה */
    var j = document.getElementById('join');
    if (j) {
      var n = M.newsletter || {}, sp = M.support || {}, html = '';
      if (n.action) {
        var hid = ''; for (var h in (n.hidden || {})) hid += '<input type="hidden" name="' + esc(h) + '" value="' + esc(n.hidden[h]) + '">';
        html += '<h2 id="joinT">רוצה את הסקירה במייל?</h2><p>כל ערב, בשעה קבועה. חינם. אפשר להסיר בלחיצה.</p>' +
          '<form class="jf" action="' + esc(n.action) + '" method="post" target="_blank">' + hid +
          '<label class="vh" for="jEmail">כתובת מייל</label><input id="jEmail" type="email" name="' + esc(n.field || 'email') + '" required placeholder="המייל שלך" autocomplete="email" inputmode="email" dir="ltr">' +
          '<label class="jc"><input type="checkbox" required> אני מסכים לקבל את הסקירה ועדכונים במייל.</label>' +
          '<button type="submit">הרשמה</button></form>';
      } else if (n.signupUrl) {
        html += '<h2 id="joinT">רוצה את הסקירה במייל?</h2><p>כל ערב, בשעה קבועה. חינם. אפשר להסיר בלחיצה.</p>' +
          '<a class="jbtn" data-j="news" href="' + esc(n.signupUrl) + '" target="_blank" rel="noopener">הרשמה במייל</a>';
      }
      if (sp.url) {
        html += (html ? '<hr>' : '<h2 id="joinT" class="vh">תמיכה</h2>') + '<p>הסקירה חינמית ותישאר חינמית. אהבת? אפשר לתמוך.</p>' +
          '<a class="jbtn alt" data-j="support" href="' + esc(sp.url) + '" target="_blank" rel="noopener">' + esc(sp.label || 'תמיכה') + '</a>';
      }
      if (html) {
        j.innerHTML = html; j.hidden = false;
        var f = j.querySelector('form');
        if (f) f.addEventListener('submit', function () { ev('newsletter-signup'); setTimeout(function () { f.innerHTML = '<p class="jok">תודה! בדוק את המייל ואשר את ההרשמה.</p>'; }, 300); });
        j.querySelectorAll('[data-j]').forEach(function (a) { a.addEventListener('click', function () { ev(a.dataset.j === 'news' ? 'newsletter-click' : 'support-click'); }); });
      }
    }

    /* קישורי "פרסמו אצלנו" */
    if (hasContact()) document.querySelectorAll('[data-adv]').forEach(function (e) { e.hidden = false; });
    if (preview) document.querySelectorAll('a[href="advertise.html"]').forEach(function (a) { a.href = 'advertise.html?money-preview'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
