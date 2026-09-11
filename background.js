chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || message.type !== 'KEY_RELAY') return;

  chrome.runtime.sendMessage({
    type: 'KEY_VIEWER_EVENT',
    kind: message.kind,
    code: message.code,
    key: message.key,
    repeat: message.repeat,
    sourceTabId: sender.tab?.id ?? null
  }).catch(() => {});
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
