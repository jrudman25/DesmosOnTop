document.addEventListener('DOMContentLoaded', () => {
  const launchBtn = document.getElementById('launch-btn');
  const launchPipBtn = document.getElementById('launch-pip-btn');
  const pipHint = document.getElementById('pip-hint');

  // Check if Document PiP API is available
  const pipSupported = 'documentPictureInPicture' in window;

  if (!pipSupported) {
    launchPipBtn.disabled = true;
    pipHint.textContent = 'Picture-in-Picture requires Chrome 116+. Use the window button above instead.';
  } else {
    pipHint.textContent = 'PiP creates a floating window that stays on top of all other windows.';
  }

  // Open Desmos in a popup-type Chrome window
  launchBtn.addEventListener('click', () => {
    chrome.windows.create({
      url: chrome.runtime.getURL('calculator.html'),
      type: 'popup',
      width: 520,
      height: 700,
      focused: true
    });
    window.close();
  });

  // Open Desmos in a popup window with auto-PiP prompt
  // PiP must be triggered from the calculator page context (not the popup)
  // because PiP windows are destroyed when their opener document closes.
  launchPipBtn.addEventListener('click', () => {
    if (!pipSupported) return;
    chrome.windows.create({
      url: chrome.runtime.getURL('calculator.html?pip=1'),
      type: 'popup',
      width: 520,
      height: 700,
      focused: true
    });
    window.close();
  });
});
