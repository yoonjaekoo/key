(() => {
  const DEFAULT_CODES = [
    'Tab','Digit1','Digit2','KeyE','KeyP','Equal','Backspace','Backslash',
    'KeyC','Space','Lang1','Comma'
  ];
  let allowedCodes = new Set(DEFAULT_CODES);

  chrome.storage.local.get('adofaiAllowedCodes').then(({ adofaiAllowedCodes }) => {
    if (Array.isArray(adofaiAllowedCodes) && adofaiAllowedCodes.every(code => typeof code === 'string')) {
      allowedCodes = new Set(adofaiAllowedCodes);
    }
  }).catch(() => {});

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.adofaiAllowedCodes) return;
    const next = changes.adofaiAllowedCodes.newValue;
    if (Array.isArray(next) && next.every(code => typeof code === 'string')) {
      allowedCodes = new Set(next);
    }
  });

  function isEditableTarget(target) {
    return target instanceof Element && Boolean(
      target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]')
    );
  }

  function relay(kind, event) {
    if (isEditableTarget(event.target)) return;
    if (!allowedCodes.has(event.code)) return;

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
