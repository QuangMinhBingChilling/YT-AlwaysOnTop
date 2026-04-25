// YouTube Minimalist Pro - Core Engine

let settings = {
  preferPiP: true,
  autoPiP: true,
  qualityLock: true
};

let lastVideoId = '';
let autoPiPPending = false;

// Load settings
function loadSettings() {
  chrome.storage.sync.get(['preferPiP', 'autoPiP', 'qualityLock'], (result) => {
    settings = { ...settings, ...result };
    checkAutoLaunch();
  });
}

loadSettings();

function toggleMode() {
  const video = document.querySelector('video');
  if (!video) return;

  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().catch(() => {});
  } else {
    video.requestPictureInPicture().catch(err => {
      autoPiPPending = true;
      console.log('YouTube Minimalist: Auto-PiP waiting for user interaction...');
    });
  }
}

// Global click listener to catch the first user interaction
document.addEventListener('click', () => {
  if (autoPiPPending && !document.pictureInPictureElement) {
    const video = document.querySelector('video');
    if (video) {
      video.requestPictureInPicture().then(() => {
        autoPiPPending = false;
      }).catch(() => {});
    }
  }
}, { capture: true });

// Auto-Launch PiP when a new video starts
function checkAutoLaunch() {
  const video = document.querySelector('video');
  const currentId = new URLSearchParams(window.location.search).get('v');

  if (video && currentId && currentId !== lastVideoId) {
    lastVideoId = currentId;
    autoPiPPending = true;
    
    // Attempt immediate PiP
    video.requestPictureInPicture().then(() => {
        autoPiPPending = false;
    }).catch(() => {});
  }
}

// Watch for URL changes (YouTube SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    checkAutoLaunch();
  }
}).observe(document, { subtree: true, childList: true });

// Auto-PiP on Tab Switch
document.addEventListener('visibilitychange', () => {
  if (settings.autoPiP) {
    const video = document.querySelector('video');
    if (document.visibilityState === 'hidden' && video && !video.paused && !document.pictureInPictureElement) {
      video.requestPictureInPicture().catch(() => {
          autoPiPPending = true;
      });
    } else if (document.visibilityState === 'visible' && document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }
  }
});

// Message Listener for Hotkey
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'togglePiP') {
    toggleMode();
  }
});

function injectButton() {
  const controls = document.querySelector('.ytp-right-controls');
  if (!controls || document.getElementById('atv-popout-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'atv-popout-btn';
  btn.className = 'ytp-button';
  btn.title = 'Truly Edgeless Mode (Alt+P)';
  
  btn.style.cssText = `
    display: inline-block !important;
    vertical-align: top !important;
    width: 36px !important;
    height: 36px !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
    outline: none !important;
  `;
  
  btn.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 36 36" style="transform: translate(-2px, -1.5px);">
      <path d="M25,17h-5v5h5V17z M29,25V11H7v14H29z M27,23H9V13h18V23z" fill="#fff" fill-opacity="0.9"></path>
    </svg>
  `;
  
  btn.onclick = (e) => {
    e.preventDefault();
    toggleMode();
  };
  
  const autoplayBtn = controls.querySelector('.ytp-autonav-toggle-button-container');
  if (autoplayBtn && autoplayBtn.nextSibling) {
    controls.insertBefore(btn, autoplayBtn.nextSibling);
  } else {
    controls.prepend(btn);
  }
}

setInterval(injectButton, 1000);
