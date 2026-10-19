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

    var heroImg = document.querySelector('.home-hero-media img'); // legacy hook: absent now, resolves at once
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
        '<li class="events-empty">We gather every week. Check the full schedule or contact us to find the next gathering near you.</li>';
      return;
    }

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    list.innerHTML = upcoming.map(function (e, i) {
      var p = e.date.split('-').map(Number);
      var d = new Date(p[0], p[1] - 1, p[2]);
      var isToday = e.date === todayKey;
      return (
        '<li class="event" data-reveal style="--d:' + i + '">' +
          '<a href="events.html" class="event-link">' +
            '<div class="event-date" aria-hidden="true"><span>' + months[d.getMonth()] + '</span><strong>' + d.getDate() + '</strong></div>' +
            '<div class="event-main">' +
              '<h3>' + esc(e.title) + '</h3>' +
              '<p>' + esc(e.place) + '</p>' +
            '</div>' +
            '<div class="event-when">' +
              (isToday ? '<em class="event-today">Today</em>' : '') +
              '<span>' + days[d.getDay()] + '</span>' +
              '<span>' + esc(e.time) + '</span>' +
            '</div>' +
            '<span class="event-arrow" aria-hidden="true">&rarr;</span>' +
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

  /* John 3:16 cycles through the languages forever. Every verse is in the HTML (stacked in one grid cell), so
     the box never changes height; we just move the `is-active` class. Pauses while the pointer is over it. */
  function initVerses() {
    var stage = document.querySelector('.verse-stage');
    if (!stage) return;
    var items = stage.querySelectorAll('.verse-item');
    var words = document.querySelectorAll('.word-item');
    var label = document.getElementById('verseLang');
    var bar = document.querySelector('.verse-progress');
    var panel = document.querySelector('.hero-panel');
    if (items.length < 2) return;

    var DURATION = 5200;
    var index = 0;
    var timer = null;
    var paused = false;
    bar.style.setProperty('--verse-ms', DURATION + 'ms');

    function restartBar() {
      bar.classList.remove('is-running');
      void bar.offsetWidth; // restart the CSS animation
      if (!paused) bar.classList.add('is-running');
    }

    function rise(prev, next) {
      // the old word slides up and out, the next one rises in from below
      if (!prev || prev === next) return;
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      next.classList.add('is-active');
      setTimeout(function () {
        prev.classList.add('no-anim');
        prev.classList.remove('is-leaving');
        void prev.offsetWidth;
        prev.classList.remove('no-anim');
      }, 1100);
    }

    function show(next) {
      var prevIndex = index;
      items[prevIndex].classList.remove('is-active');
      items[prevIndex].setAttribute('aria-hidden', 'true');
      index = next;
      var item = items[index];
      item.classList.add('is-active');
      item.removeAttribute('aria-hidden');
      if (words.length === items.length) rise(words[prevIndex], words[index]);

      var native = item.getAttribute('data-native');
      var english = item.getAttribute('data-english');
      label.style.opacity = 0;
      setTimeout(function () {
        label.textContent = native === english ? english : native + ' \u00B7 ' + english;
        label.style.opacity = 1;
      }, 350);
    }

    function schedule() {
      clearTimeout(timer);
      restartBar();
      timer = setTimeout(function () {
        show((index + 1) % items.length);
        schedule();
      }, DURATION);
    }

    items.forEach(function (it, i) { if (i !== 0) it.setAttribute('aria-hidden', 'true'); });

    // pause while the pointer is over the panel so a verse can be read in peace
    var hoverTarget = panel || stage;
    hoverTarget.addEventListener('mouseenter', function () {
      paused = true;
      clearTimeout(timer);
      bar.classList.remove('is-running');
    });
    hoverTarget.addEventListener('mouseleave', function () {
      paused = false;
      schedule();
    });

    function begin() {
      if (html.classList.contains('hero-go')) {
        setTimeout(schedule, 900);
        return;
      }
      var observer = new MutationObserver(function () {
        if (html.classList.contains('hero-go')) {
          observer.disconnect();
          setTimeout(schedule, 900);
        }
      });
      observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    }
    begin();
  }

  initIntro();
  document.addEventListener('DOMContentLoaded', function () {
    initSchedule();
    initCounters();
    initVerses();
  });
})();
