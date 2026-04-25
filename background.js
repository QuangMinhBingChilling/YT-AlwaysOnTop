chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-pip') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('youtube.com/watch')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'togglePiP' });
      }
    });
  }
});
