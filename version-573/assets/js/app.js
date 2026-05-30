document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
    initSearchForms();
    initPlayers();
});

function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function initHero() {
    var root = document.querySelector("[data-hero-carousel]");

    if (!root) {
        return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            show(Number(dot.getAttribute("data-hero-dot")) || 0);
            start();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            show(index - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            start();
        });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
}

function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));

    forms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            var value = input ? input.value.trim() : "";

            if (!value) {
                return;
            }

            event.preventDefault();
            window.location.href = "./search.html?q=" + encodeURIComponent(value);
        });
    });
}

function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-region-filter]");
    var year = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");

    if (!cards.length) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    if (q && input) {
        input.value = q;
    }

    function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var text = card.getAttribute("data-search") || "";
            var cardRegion = card.getAttribute("data-region") || "";
            var cardYear = card.getAttribute("data-year") || "";
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }

            if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                matched = false;
            }

            if (yearValue && cardYear !== yearValue) {
                matched = false;
            }

            card.hidden = !matched;

            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    [input, region, year].forEach(function (element) {
        if (element) {
            element.addEventListener("input", apply);
            element.addEventListener("change", apply);
        }
    });

    apply();
}

function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");

        if (!video || !button) {
            return;
        }

        function start() {
            loadStream(video);
            button.classList.add("is-hidden");
            video.play().catch(function () {
                button.classList.remove("is-hidden");
            });
        }

        button.addEventListener("click", start);
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
    });
}

function loadStream(video) {
    var stream = video.getAttribute("data-stream");

    if (!stream || video.getAttribute("data-ready") === "true") {
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.setAttribute("data-ready", "true");
        return;
    }

    if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        video.setAttribute("data-ready", "true");
        return;
    }

    video.src = stream;
    video.setAttribute("data-ready", "true");
}
