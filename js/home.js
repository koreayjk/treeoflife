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

  /* Scripture in many languages. Every few seconds a random (verse, language) pair fades in; the same verse or the
     same language never shows twice in a row, and the pace never changes (it does not pause on hover). Two layers
     cross-fade, and the box is sized to the tallest text so the page below never jumps. Data: js/verses.js */
  function initVerses() {
    var stage = document.getElementById('verseStage');
    var verses = window.TOL_VERSES;
    var langs = window.TOL_VERSE_LANGS;
    if (!stage || !verses || !langs) return;
    var refEl = document.getElementById('verseRef');
    var langEl = document.getElementById('verseLang');
    var bar = document.querySelector('.verse-progress');

    var DURATION = 6500;
    var langByCode = {};
    langs.forEach(function (l) { langByCode[l.code] = l; });

    var pairs = [];
    verses.forEach(function (v, vi) {
      langs.forEach(function (l) {
        if (v.t[l.code]) pairs.push({ v: vi, code: l.code });
      });
    });

    function shuffle(list) {
      for (var i = list.length - 1; i > 0; i--) {
        var k = Math.floor(Math.random() * (i + 1));
        var tmp = list[i]; list[i] = list[k]; list[k] = tmp;
      }
      return list;
    }

    // a shuffled order where neighbours differ in both verse and language
    function makeQueue(prev) {
      var q = shuffle(pairs.slice());
      for (var i = 0; i < q.length; i++) {
        var before = i === 0 ? prev : q[i - 1];
        if (!before) continue;
        if (q[i].v === before.v || q[i].code === before.code) {
          for (var k = i + 1; k < q.length; k++) {
            if (q[k].v !== before.v && q[k].code !== before.code) {
              var t = q[i]; q[i] = q[k]; q[k] = t;
              break;
            }
          }
        }
      }
      return q;
    }

    // layer A is the static English John 3:16 from the HTML; layer B is created here
    var layerA = stage.querySelector('.verse-item');
    var layerB = layerA.cloneNode(false);
    layerB.classList.remove('is-active');
    layerB.setAttribute('aria-hidden', 'true');
    stage.appendChild(layerB);
    var front = layerA, back = layerB;

    function fill(layer, pair) {
      var l = langByCode[pair.code];
      layer.textContent = verses[pair.v].t[pair.code];
      layer.setAttribute('lang', l.code);
      layer.setAttribute('dir', l.dir);
    }

    // reserve the height of the tallest text at the current width
    function reserveHeight() {
      var probe = document.createElement('div');
      probe.className = 'verse-item';
      probe.style.cssText = 'position:absolute;left:0;right:0;top:0;visibility:hidden;opacity:1;transform:none;pointer-events:none';
      stage.appendChild(probe);
      var max = 0;
      pairs.forEach(function (pr) {
        fill(probe, pr);
        if (probe.offsetHeight > max) max = probe.offsetHeight;
      });
      stage.removeChild(probe);
      stage.style.minHeight = max + 'px';
    }

    var current = { v: 0, code: 'en' };
    var queue = [];

    function restartBar() {
      bar.style.setProperty('--verse-ms', DURATION + 'ms');
      bar.classList.remove('is-running');
      void bar.offsetWidth; // restart the CSS animation
      bar.classList.add('is-running');
    }

    function next() {
      if (!queue.length) queue = makeQueue(current);
      var pair = queue.shift();
      current = pair;

      fill(back, pair);
      back.removeAttribute('aria-hidden');
      back.classList.add('is-active');
      front.classList.remove('is-active');
      front.setAttribute('aria-hidden', 'true');
      var tmp = front; front = back; back = tmp;

      var l = langByCode[pair.code];
      refEl.style.opacity = 0;
      langEl.style.opacity = 0;
      setTimeout(function () {
        refEl.textContent = verses[pair.v].ref;
        langEl.textContent = l.native === l.english ? l.english : l.native + ' \u00B7 ' + l.english;
        refEl.style.opacity = 1;
        langEl.style.opacity = 1;
      }, 350);
      restartBar();
    }

    function begin() {
      reserveHeight();
      restartBar();
      setInterval(next, DURATION);
      var timer;
      window.addEventListener('resize', function () {
        clearTimeout(timer);
        timer = setTimeout(reserveHeight, 200);
      });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserveHeight);
    }

    function whenHeroIsUp(fn) {
      if (html.classList.contains('hero-go')) {
        setTimeout(fn, 900);
        return;
      }
      var observer = new MutationObserver(function () {
        if (html.classList.contains('hero-go')) {
          observer.disconnect();
          setTimeout(fn, 900);
        }
      });
      observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    }
    whenHeroIsUp(begin);
  }

  /* Hero photo: gallery photos dissolve into one another every 10 seconds. Only the next photo is
     fetched (just before it is needed) so the page does not download all twelve at once. */
  function initHeroSlides() {
    var slides = document.querySelectorAll('.hero-slides .slide');
    if (slides.length < 2) return;

    var INTERVAL = 10000;
    var current = 0;

    function load(el) {
      var src = el.getAttribute('data-src');
      if (src) {
        el.src = src;
        el.removeAttribute('data-src');
      }
    }

    function swapTo(next) {
      slides[current].classList.remove('is-active');
      slides[next].classList.add('is-active');
      current = next;
    }

    function advance() {
      var next = (current + 1) % slides.length;
      var img = slides[next];
      load(img);
      if (img.complete && img.naturalWidth) {
        swapTo(next);
      } else {
        var done = function () { swapTo(next); };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
      load(slides[(next + 1) % slides.length]); // warm up the one after
    }

    function start() {
      load(slides[1]);
      setInterval(advance, INTERVAL);
    }

    if (html.classList.contains('hero-go')) {
      start();
      return;
    }
    var observer = new MutationObserver(function () {
      if (html.classList.contains('hero-go')) {
        observer.disconnect();
        start();
      }
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  initIntro();
  document.addEventListener('DOMContentLoaded', function () {
    initSchedule();
    initCounters();
    initVerses();
    initHeroSlides();
  });
})();
