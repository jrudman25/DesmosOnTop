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

  // Open Desmos in a Document PiP window
  launchPipBtn.addEventListener('click', async () => {
    if (!pipSupported) return;

    try {
      const pipWindow = await documentPictureInPicture.requestWindow({
        width: 480,
        height: 640,
        disallowReturnToOpener: true
      });

      // Build the PiP document
      const doc = pipWindow.document;

      // Reset styles
      const style = doc.createElement('style');
      style.textContent = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #1a1a2e; }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 12px;
          background: #16213e;
          border-bottom: 1px solid #2d70b344;
          height: 36px;
          -webkit-app-region: drag;
        }
        .toolbar-title {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #7eb8e6;
        }
        .calc-select {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11px;
          background: #1a1a2e;
          color: #a0a0b8;
          border: 1px solid #2d70b344;
          border-radius: 4px;
          padding: 2px 6px;
          cursor: pointer;
          -webkit-app-region: no-drag;
        }
        .calc-select:focus { outline: 1px solid #2d70b3; }
        iframe {
          width: 100%;
          height: calc(100% - 36px);
          border: none;
        }
      `;
      doc.head.appendChild(style);

      // Toolbar
      const toolbar = doc.createElement('div');
      toolbar.className = 'toolbar';

      const title = doc.createElement('span');
      title.className = 'toolbar-title';
      title.textContent = 'Desmos Calculator';

      const select = doc.createElement('select');
      select.className = 'calc-select';
      const modes = [
        { value: 'https://www.desmos.com/calculator', label: 'Graphing' },
        { value: 'https://www.desmos.com/scientific', label: 'Scientific' },
        { value: 'https://www.desmos.com/fourfunction', label: 'Basic' },
        { value: 'https://www.desmos.com/matrix', label: 'Matrix' },
        { value: 'https://www.desmos.com/geometry', label: 'Geometry' }
      ];
      modes.forEach(m => {
        const opt = doc.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        select.appendChild(opt);
      });

      toolbar.appendChild(title);
      toolbar.appendChild(select);
      doc.body.appendChild(toolbar);

      // Desmos iframe
      const iframe = doc.createElement('iframe');
      iframe.src = 'https://www.desmos.com/calculator';
      iframe.allow = 'clipboard-write';
      doc.body.appendChild(iframe);

      // Mode switching
      select.addEventListener('change', () => {
        iframe.src = select.value;
      });

      window.close();
    } catch (err) {
      pipHint.textContent = 'Failed to open PiP: ' + err.message;
      pipHint.style.color = '#e06060';
    }
  });
});
