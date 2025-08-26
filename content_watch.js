
(function() {
  function ensurePlay() {
    const video = document.querySelector('video');
    if (video) {
      // Some browsers block autoplay; attempt user-gesture emulation by triggering play.
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(() => {
          // As a fallback, simulate a keypress 'k' (toggle play/pause) to hint YouTube player.
          const evt = new KeyboardEvent('keydown', { key: 'k', bubbles: true });
          document.dispatchEvent(evt);
        });
      }
      return true;
    }
    return false;
  }

  if (!ensurePlay()) {
    const observer = new MutationObserver(() => {
      if (ensurePlay()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 8000);
  }
})();
