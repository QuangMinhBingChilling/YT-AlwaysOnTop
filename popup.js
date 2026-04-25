const toggles = ['preferPiP', 'autoPiP', 'qualityLock'];

chrome.storage.sync.get(toggles, (result) => {
  toggles.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = result[id] !== false;
  });
});

toggles.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', (e) => {
      const value = e.target.checked;
      chrome.storage.sync.set({ [id]: value }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].url.includes('youtube.com/watch')) {
            chrome.tabs.reload(tabs[0].id);
          }
        });
      });
    });
  }
});
