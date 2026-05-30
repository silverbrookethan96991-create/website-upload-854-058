(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var dotsWrap = hero.querySelector('[data-hero-dots]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === active);
        });
      }
    }

    function playSlides() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换影片');
        dot.addEventListener('click', function () {
          showSlide(i);
          playSlides();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        playSlides();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        playSlides();
      });
    }

    showSlide(0);
    playSlides();
  }

  var filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var formData = new FormData(filterForm);
      var keyword = normalize(formData.get('keyword'));
      var year = normalize(formData.get('year'));
      var type = normalize(formData.get('type'));

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var okKeyword = keyword === '' || haystack.indexOf(keyword) !== -1;
        var okYear = year === '' || normalize(card.getAttribute('data-year')) === year;
        var cardType = normalize(card.getAttribute('data-type'));
        var okType = type === '' || cardType.indexOf(type) !== -1 || haystack.indexOf(type) !== -1;
        card.classList.toggle('is-hidden', !(okKeyword && okYear && okType));
      });
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    Array.prototype.slice.call(filterForm.elements).forEach(function (item) {
      item.addEventListener('input', applyFilter);
      item.addEventListener('change', applyFilter);
    });
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var stream = player.getAttribute('data-stream');
    var hls = null;

    function attachStream() {
      if (!video || !stream || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    }

    function startVideo() {
      attachStream();
      if (!video) {
        return;
      }
      video.setAttribute('controls', 'controls');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
