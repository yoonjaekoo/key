(() => {
  function isEditableTarget(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return true;
    return false;
  }

  function relay(kind, event) {
    if (isEditableTarget(event.target)) return;
    chrome.runtime.sendMessage({
      type: 'KEY_RELAY',
      kind,
      code: event.code,
      key: event.key,
      repeat: event.repeat,
      time: performance.now()
    }).catch(() => {});
  }

  window.addEventListener('keydown', event => relay('keydown', event), true);
  window.addEventListener('keyup', event => relay('keyup', event), true);
})();
