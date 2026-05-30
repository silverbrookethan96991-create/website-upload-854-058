const Site = (() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  const initMenu = () => {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  };

  const initBackTop = () => {
    const button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    const sync = () => {
      button.classList.toggle("show", window.scrollY > 320);
    };
    window.addEventListener("scroll", sync, { passive: true });
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    sync();
  };

  const initHero = () => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    let index = 0;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    };
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => show(i));
    });
    setInterval(() => show(index + 1), 5200);
  };

  const initFilters = () => {
    const input = document.querySelector("[data-search-input]");
    const region = document.querySelector("[data-filter-region]");
    const year = document.querySelector("[data-filter-year]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    if (!cards.length || (!input && !region && !year)) {
      return;
    }
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "没有找到匹配的影片";
    const holder = cards[cards.length - 1].parentElement;
    holder.after(empty);
    const sync = () => {
      const q = input ? input.value.trim().toLowerCase() : "";
      const r = region ? region.value.trim() : "";
      const y = year ? year.value.trim() : "";
      let visible = 0;
      cards.forEach((card) => {
        const text = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
        const regionOk = !r || (card.dataset.region || "").includes(r);
        const yearOk = !y || card.dataset.year === y;
        const queryOk = !q || text.includes(q);
        const show = regionOk && yearOk && queryOk;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      empty.style.display = visible ? "none" : "block";
    };
    [input, region, year].forEach((el) => {
      if (el) {
        el.addEventListener("input", sync);
        el.addEventListener("change", sync);
      }
    });
  };

  const player = ({ shellId, videoId, buttonId, source }) => {
    ready(() => {
      const shell = document.getElementById(shellId);
      const video = document.getElementById(videoId);
      const button = document.getElementById(buttonId);
      if (!shell || !video || !button || !source) {
        return;
      }
      let prepared = false;
      let hls = null;
      const prepare = () => {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      };
      const start = () => {
        prepare();
        shell.classList.add("is-playing");
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {
            shell.classList.remove("is-playing");
          });
        }
      };
      button.addEventListener("click", start);
      shell.addEventListener("click", (event) => {
        if (event.target === shell) {
          start();
        }
      });
      video.addEventListener("play", () => shell.classList.add("is-playing"));
      video.addEventListener("pause", () => {
        if (video.currentTime === 0) {
          shell.classList.remove("is-playing");
        }
      });
      window.addEventListener("pagehide", () => {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  };

  ready(() => {
    initMenu();
    initBackTop();
    initHero();
    initFilters();
  });

  return { player };
})();
