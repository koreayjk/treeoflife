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

  initIntro();
  document.addEventListener('DOMContentLoaded', initSchedule);
})();
