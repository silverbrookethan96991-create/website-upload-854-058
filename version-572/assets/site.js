(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
        initHlsPlayers();
    });

    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-thumb]'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('active', thumbIndex === index);
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

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var next = Number(thumb.getAttribute('data-hero-thumb')) || 0;
                show(next);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);

        if (slides.length > 1) {
            start();
        }
    }

    function uniqueValues(cards, attribute) {
        var values = [];
        var seen = Object.create(null);

        cards.forEach(function (card) {
            var value = (card.getAttribute(attribute) || '').trim();
            if (value && !seen[value]) {
                seen[value] = true;
                values.push(value);
            }
        });

        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }

        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-movie-grid]');

        if (!panel || !grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var search = panel.querySelector('[data-filter-search]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var result = panel.querySelector('[data-filter-result]');
        var reset = panel.querySelector('[data-filter-reset]');

        fillSelect(typeSelect, uniqueValues(cards, 'data-type'));
        fillSelect(yearSelect, uniqueValues(cards, 'data-year'));
        fillSelect(regionSelect, uniqueValues(cards, 'data-region'));

        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q');
        if (queryFromUrl && search) {
            search.value = queryFromUrl;
        }

        function applyFilter() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var ok = true;

                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    ok = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }

                card.classList.toggle('hidden-card', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (result) {
                result.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
            }
        }

        [search, typeSelect, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                window.setTimeout(function () {
                    if (search) {
                        search.value = '';
                    }
                    applyFilter();
                }, 0);
            });
        }

        applyFilter();
    }

    function initHlsPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));

        players.forEach(function (container) {
            var video = container.querySelector('video');
            var startButton = container.querySelector('[data-player-start]');
            var message = container.querySelector('[data-player-message]');
            var hlsInstance = null;
            var initialized = false;

            if (!video) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                    });
                }
            }

            function initialize() {
                var source = video.getAttribute('data-src');

                if (!source) {
                    setMessage('未找到可用播放源。');
                    return;
                }

                if (initialized) {
                    playVideo();
                    return;
                }

                initialized = true;
                setMessage('正在初始化 HLS 播放源...');

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('播放源加载完成。');
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源加载失败，请刷新页面重试。');
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                            initialized = false;
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setMessage('播放源加载完成。');
                        playVideo();
                    }, { once: true });
                } else {
                    setMessage('当前浏览器不支持 HLS 播放，请更换浏览器或启用 HLS 支持。');
                }
            }

            if (startButton) {
                startButton.addEventListener('click', function () {
                    startButton.classList.add('hidden');
                    initialize();
                });
            }

            video.addEventListener('play', function () {
                if (startButton) {
                    startButton.classList.add('hidden');
                }
            });
        });
    }
})();
