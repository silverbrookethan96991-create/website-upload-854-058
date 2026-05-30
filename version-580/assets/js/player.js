(function () {
  window.setupVideoPlayer = function (src) {
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('.player-overlay');
    var trigger = document.querySelector('.player-start');
    var hls = null;
    var ready = false;

    if (!video || !src) {
      return;
    }

    var load = function () {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };

    var play = function () {
      load();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    };

    if (trigger) {
      trigger.addEventListener('click', play);
    }
    if (overlay && overlay !== trigger) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
