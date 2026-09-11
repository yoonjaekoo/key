chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== 'ADOFAI_KEY_RELAY') return;

  const forwarded = {
    type: 'ADOFAI_KEY_VIEWER_EVENT',
    kind: message.kind,
    code: message.code,
    repeat: Boolean(message.repeat)
  };

  // Extension page listeners (chrome-extension://.../index.html)
  chrome.runtime.sendMessage(forwarded).catch(() => {});

  // Hosted viewer bridge (https://yoonjaekoo.github.io/key/)
  chrome.tabs.query({}).then(tabs => {
    for (const tab of tabs) {
      if (typeof tab.id !== 'number') continue;
      chrome.tabs.sendMessage(tab.id, forwarded).catch(() => {});
    }
  }).catch(() => {});
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
