(() => {
  const ALLOWED_CODES = new Set([
    'Tab','Digit1','Digit2','KeyE','KeyP','Equal','Backspace','Backslash',
    'KeyC','Space','Lang1','HangulMode','Comma'
  ]);

  function isEditableTarget(target) {
    return target instanceof Element && Boolean(
      target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]')
    );
  }

  function relay(kind, event) {
    if (isEditableTarget(event.target)) return;
    if (!ALLOWED_CODES.has(event.code)) return;

    chrome.runtime.sendMessage({
      type: 'ADOFAI_KEY_RELAY',
      kind,
      code: event.code,
      repeat: Boolean(event.repeat)
    }).catch(() => {});
  }

  window.addEventListener('keydown', event => relay('keydown', event), true);
  window.addEventListener('keyup', event => relay('keyup', event), true);
})();
