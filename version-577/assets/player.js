(function () {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-cover]');
  var buttons = document.querySelectorAll('[data-player-start]');
  var message = document.querySelector('[data-player-message]');
  var playlistUrl = typeof PLAYLIST_URL !== 'undefined' ? PLAYLIST_URL : '';
  var prepared = false;
  var hls = null;

  if (!video || !playlistUrl) {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add('show');
  }

  function prepareVideo() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playlistUrl;
      return;
    }

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(playlistUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        showMessage('播放暂时不可用，请稍后再试');
        hls.destroy();
      });
      return;
    }

    showMessage('播放暂时不可用，请稍后再试');
  }

  function startPlayback() {
    prepareVideo();
    video.controls = true;

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showMessage('点击视频区域即可继续播放');
      });
    }
  }

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener('click', startPlayback);
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
