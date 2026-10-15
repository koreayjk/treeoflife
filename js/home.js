/**
 * Home page: intro loader hand-off to the hero, and the "Upcoming Gatherings" list.
 * The <html> classes `intro-on` / `hero-go` are set by the inline script in index.html's <head>.
 */
(function () {
  var html = document.documentElement;
  var loader = document.getElementById('introLoader');

  function startHero() {
    html.classList.add('hero-go');
  }

  function initIntro() {
    if (!loader) return;
    if (!html.classList.contains('intro-on')) {
      loader.remove();
      return;
    }

    var MIN_VISIBLE_MS = 1700;
    var started = Date.now();
    var finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem('tol_intro', '1'); } catch (e) { /* private mode */ }
      loader.classList.add('is-done');
      startHero();
      setTimeout(function () {
        html.classList.remove('intro-on');
        loader.remove();
      }, 900);
    }

    var heroImg = document.querySelector('.home-hero-media img');
    var imageReady = new Promise(function (resolve) {
      if (!heroImg || heroImg.complete) return resolve();
      heroImg.addEventListener('load', resolve);
      heroImg.addEventListener('error', resolve);
    });

    imageReady.then(function () {
      setTimeout(finish, Math.max(0, MIN_VISIBLE_MS - (Date.now() - started)));
    });
    loader.addEventListener('click', finish);
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function initSchedule() {
    var list = document.getElementById('upcomingList');
    if (!list) return;

    var now = new Date();
    var todayKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    var upcoming = (window.TOL_PUBLIC_SCHEDULE || [])
      .filter(function (e) { return e && e.date >= todayKey; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; })
      .slice(0, 3);

    if (!upcoming.length) {
      list.innerHTML =
        '<li class="upcoming-empty">We gather every week. Check the full schedule or contact us to find the next gathering near you.</li>';
      return;
    }

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    list.innerHTML = upcoming.map(function (e, i) {
      var p = e.date.split('-').map(Number);
      var d = new Date(p[0], p[1] - 1, p[2]);
      var isToday = e.date === todayKey;
      return (
        '<li class="upcoming-item" data-reveal style="--d:' + i + '">' +
          '<a href="events.html" class="upcoming-link">' +
            '<div class="upcoming-date" aria-hidden="true"><span>' + months[d.getMonth()] + '</span><strong>' + d.getDate() + '</strong></div>' +
            '<div class="upcoming-body">' +
              '<div class="upcoming-meta">' + (isToday ? '<em class="upcoming-today">Today</em>' : '') +
                days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ' · ' + esc(e.time) +
                (e.tag ? ' <span class="upcoming-tag">' + esc(e.tag) + '</span>' : '') + '</div>' +
              '<h3>' + esc(e.title) + '</h3>' +
              '<p><i class="fa-solid fa-location-dot"></i> ' + esc(e.place) + '</p>' +
            '</div>' +
            '<i class="fa-solid fa-chevron-right upcoming-arrow" aria-hidden="true"></i>' +
          '</a>' +
        '</li>'
      );
    }).join('');

    if (typeof window.tolObserveReveal === 'function') window.tolObserveReveal(list);
  }

  /* Stat numbers (12+, 500,000+) roll up like an odometer once the hero is revealed. Each digit is a
     vertical strip that slides to its final value, which stays smooth (no rapidly changing text). The static
     HTML already holds the final values, so they stay correct if scripts fail. */
  function buildOdometer(el) {
    var finalText = Math.round(Number(el.getAttribute('data-count'))).toLocaleString('en-US') +
      (el.getAttribute('data-suffix') || '');
    var digitCount = finalText.replace(/[^0-9]/g, '').length;

    el.setAttribute('aria-label', finalText);
    el.textContent = '';

    var wrap = document.createElement('span');
    wrap.className = 'odo';
    wrap.setAttribute('aria-hidden', 'true');

    var strips = [];
    var digitIndex = 0;
    finalText.split('').forEach(function (ch) {
      if (!/[0-9]/.test(ch)) {
        var fixed = document.createElement('span');
        fixed.className = 'odo-fixed';
        fixed.textContent = ch;
        wrap.appendChild(fixed);
        return;
      }
      var target = Number(ch);
      // a "0" would not move at all, so let it make one full turn (0 -> 9 -> 0)
      var rows = target === 0 ? 10 : target;
      var win = document.createElement('span');
      win.className = 'odo-digit';
      var strip = document.createElement('span');
      strip.className = 'odo-strip';
      var html = '';
      for (var n = 0; n <= rows; n++) html += '<span>' + (n % 10) + '</span>';
      strip.innerHTML = html;
      strip.style.setProperty('--rows', rows);
      strip.style.transitionDelay = (digitIndex * 90) + 'ms';
      win.appendChild(strip);
      wrap.appendChild(win);
      strips.push(strip);
      digitIndex++;
    });

    el.appendChild(wrap);
    return strips;
  }

  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    var groups = [];
    els.forEach(function (el) { groups.push(buildOdometer(el)); });

    function run() {
      // wait for the stats row to finish fading in
      setTimeout(function () {
        requestAnimationFrame(function () {
          groups.forEach(function (strips) {
            strips.forEach(function (strip) { strip.classList.add('is-rolling'); });
          });
        });
      }, 800);
    }

    if (html.classList.contains('hero-go')) {
      run();
      return;
    }
    var observer = new MutationObserver(function () {
      if (html.classList.contains('hero-go')) {
        observer.disconnect();
        run();
      }
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  initIntro();
  document.addEventListener('DOMContentLoaded', function () {
    initSchedule();
    initCounters();
  });
})();
