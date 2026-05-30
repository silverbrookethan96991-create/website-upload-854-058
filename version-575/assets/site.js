(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const backTop = document.querySelector(".back-top");
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const heroDots = Array.from(document.querySelectorAll("[data-hero-dot]"));

  if (heroSlides.length > 1) {
    let heroIndex = 0;

    const showHero = function (index) {
      heroIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === heroIndex);
      });
      heroDots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === heroIndex);
      });
    };

    heroDots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showHero(dotIndex);
      });
    });

    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));

  function refreshCards(root) {
    const cards = Array.from(document.querySelectorAll(".movie-card, .rank-row"));
    const empty = document.querySelector(".empty-state");
    const activeFilter = document.querySelector("[data-filter].is-active");
    const filterValue = activeFilter ? activeFilter.getAttribute("data-filter") : "all";
    const queryValues = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean);
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = (card.getAttribute("data-search") || "").toLowerCase();
      const category = card.getAttribute("data-category") || "";
      const passSearch = queryValues.every(function (value) {
        return haystack.indexOf(value) !== -1;
      });
      const passFilter = !filterValue || filterValue === "all" || category === filterValue;
      const show = passSearch && passFilter;
      card.classList.toggle("hidden-card", !show);
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
      refreshCards(document);
    });
  });

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      refreshCards(document);
    });
  });
})();
