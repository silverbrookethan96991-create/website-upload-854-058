(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;
    var show = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(index + 1);
      });
    }
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(index - 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
  roots.forEach(function (root) {
    var input = root.querySelector('[data-filter-input]');
    var year = root.querySelector('[data-filter-year]');
    var clear = root.querySelector('[data-filter-clear]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var match = function (card, q, y) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var okText = !q || text.indexOf(q) !== -1;
      var okYear = !y || cardYear === y;
      return okText && okYear;
    };
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      cards.forEach(function (card) {
        card.classList.toggle('is-hidden-card', !match(card, q, y));
      });
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }
    if (root.hasAttribute('data-search-page')) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      var topInput = document.querySelector('[data-search-page-input]');
      if (q) {
        if (topInput) {
          topInput.value = q;
        }
        if (input) {
          input.value = q;
        }
        apply();
      }
    }
  });
})();
