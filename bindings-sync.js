(() => {
  if (!globalThis.chrome?.storage?.local) return;

  let last = '';
  const sync = () => {
    if (!Array.isArray(KEYS)) return;
    const codes = KEYS.map(k => k.code).filter(code => typeof code === 'string');
    const signature = JSON.stringify(codes);
    if (signature === last) return;
    last = signature;
    chrome.storage.local.set({ adofaiAllowedCodes: codes }).catch(() => {});
  };

  sync();
  setInterval(sync, 400);
})();
