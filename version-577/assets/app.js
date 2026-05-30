(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        resetTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var cardSearch = document.querySelector('[data-card-search]');
  var cardYear = document.querySelector('[data-card-year]');
  var cardType = document.querySelector('[data-card-type]');
  var cardList = document.querySelector('[data-card-list]');
  var emptyState = document.querySelector('[data-empty-state]');

  if (cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-movie-card]'));

    function filterCards() {
      var keyword = cardSearch ? cardSearch.value.trim().toLowerCase() : '';
      var year = cardYear ? cardYear.value : '';
      var type = cardType ? cardType.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') || '').toLowerCase();
        var cardYearValue = card.getAttribute('data-year') || '';
        var cardTypeValue = card.getAttribute('data-type') || '';
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYearValue !== year) {
          matched = false;
        }

        if (type && cardTypeValue.indexOf(type) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    [cardSearch, cardYear, cardType].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }

  var searchInput = document.querySelector('[data-search-page-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchEmpty = document.querySelector('[data-search-empty]');
  var searchTitle = document.querySelector('[data-search-title]');

  if (searchInput && searchResults && typeof MOVIE_DATA !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchInput.value = query;

    function renderResults(value) {
      var term = value.trim().toLowerCase();
      var pool = MOVIE_DATA;

      if (term) {
        pool = MOVIE_DATA.filter(function (movie) {
          return movie.search.indexOf(term) !== -1;
        });
      }

      var results = pool.slice(0, 120);
      var markup = results.map(function (movie) {
        return [
          '<article class="movie-card compact">',
          '<a class="poster-wrap" href="' + movie.href + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="poster-play">▶</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '<h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>',
          '<p>' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');

      searchResults.innerHTML = markup;

      if (searchTitle) {
        searchTitle.textContent = term ? '与“' + value.trim() + '”相关的影片' : '推荐内容';
      }

      if (searchEmpty) {
        searchEmpty.classList.toggle('show', results.length === 0);
      }
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    searchInput.addEventListener('input', function () {
      renderResults(searchInput.value);
    });

    renderResults(query);
  }
})();
