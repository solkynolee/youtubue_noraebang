
(function() {
  // Wait for search results to appear, then click the first video.
  function tryClickTop() {
    // YouTube often renders results as ytd-video-renderer
    const first = document.querySelector('ytd-video-renderer a#thumbnail, ytd-video-renderer a#video-title');
    if (first) {
      // Avoid infinite loop on watch pages that also contain suggested videos.
      if (location.pathname.startsWith('/results')) {
        first.click();
        return true;
      }
    }
    return false;
  }

  if (!tryClickTop()) {
    const observer = new MutationObserver((mutations) => {
      if (tryClickTop()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // Failsafe: stop observing after 10 seconds
    setTimeout(() => observer.disconnect(), 10000);
  }
})();
