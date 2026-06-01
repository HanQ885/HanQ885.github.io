(() => {
  'use strict';
  const message = document.getElementById('message');
  const actions = document.getElementById('actions');
  let lastSubmitError = '';

  const observer = new MutationObserver(() => {
    const text = message.textContent.trim();
    if (text) {
      lastSubmitError = text;
      return;
    }

    setTimeout(() => {
      const stillOnSubmit = actions.textContent.includes('제출하기') || actions.textContent.includes('제출 중');
      if (!message.textContent.trim() && lastSubmitError && stillOnSubmit) {
        message.textContent = lastSubmitError;
      }
      if (!stillOnSubmit) {
        lastSubmitError = '';
      }
    }, 0);
  });

  observer.observe(message, { childList: true, characterData: true, subtree: true });
})();
