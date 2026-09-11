chrome.runtime.onMessage.addListener(message => {
  if (!message || message.type !== 'ADOFAI_KEY_VIEWER_EVENT') return;

  const event = new KeyboardEvent(message.kind, {
    code: message.code,
    key: '',
    repeat: Boolean(message.repeat),
    bubbles: true,
    cancelable: true
  });

  window.dispatchEvent(event);
});
