// YouTube Minimalist Pro - Popup Script

const toggles = ['preferPiP', 'autoPiP', 'qualityLock'];

// Load saved settings
chrome.storage.sync.get(toggles, (result) => {
  toggles.forEach(id => {
    // Default to true if not set
    const el = document.getElementById(id);
    if (el) el.checked = result[id] !== false;
  });
});

// Save settings on change
toggles.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', (e) => {
      const value = e.target.checked;
      chrome.storage.sync.set({ [id]: value }, () => {
        // Reload the active YouTube tab to apply changes immediately
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].url.includes('youtube.com/watch')) {
            chrome.tabs.reload(tabs[0].id);
          }
        });
      });
    });
  }
});
