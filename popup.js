document.getElementById('toggle').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.local.get('enabled', (data) => {
    const newState = !data.enabled;
    chrome.storage.local.set({enabled: newState});
    document.getElementById('toggle').textContent = newState ? '✅ Enabled' : '🚫 Disabled';
    chrome.tabs.sendMessage(tab.id, {action: "toggle", enabled: newState});
  });
});
