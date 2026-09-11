chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== 'ADOFAI_KEY_RELAY') return;

  chrome.runtime.sendMessage({
    type: 'ADOFAI_KEY_VIEWER_EVENT',
    kind: message.kind,
    code: message.code,
    repeat: Boolean(message.repeat)
  }).catch(() => {});
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
