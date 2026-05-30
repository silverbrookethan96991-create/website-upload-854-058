(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearch() {
    var inputs = document.querySelectorAll("[data-site-search]");
    if (!inputs.length || !window.SITE_MOVIES) {
      return;
    }
    inputs.forEach(function (input) {
      var shell = input.closest(".search-shell");
      var panel = shell ? shell.querySelector("[data-search-panel]") : null;
      if (!panel) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        if (query.length < 1) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var results = window.SITE_MOVIES.filter(function (item) {
          return item.text.toLowerCase().indexOf(query) !== -1;
        }).slice(0, 8);
        panel.innerHTML = results.map(function (item) {
          return '<a href="' + item.url + '"><strong>' + item.title + '</strong><small>' + item.meta + '</small></a>';
        }).join("");
        panel.classList.toggle("is-open", results.length > 0);
      });
      document.addEventListener("click", function (event) {
        if (!shell.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function setupPageFilter() {
    var grids = document.querySelectorAll("[data-filter-grid]");
    grids.forEach(function (grid) {
      var input = document.querySelector("[data-page-filter]");
      var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
      var empty = document.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      var activeValue = "全部";
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchValue = activeValue === "全部" || text.indexOf(activeValue.toLowerCase()) !== -1;
          var showCard = matchQuery && matchValue;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeValue = button.getAttribute("data-filter-value") || "全部";
          apply();
        });
      });
      if (buttons.length) {
        buttons[0].classList.add("is-active");
      }
      apply();
    });
  }

  window.initMoviePlayer = function (source) {
    ready(function () {
      var video = document.querySelector("[data-video-player]");
      var cover = document.querySelector("[data-video-cover]");
      var button = document.querySelector("[data-video-play]");
      if (!video || !source) {
        return;
      }
      var attached = false;
      var hlsInstance = null;
      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      function start(event) {
        if (event) {
          event.preventDefault();
        }
        attach();
        video.controls = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", start);
      }
      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    setupNavigation();
    setupSearch();
    setupHero();
    setupPageFilter();
  });
})();
