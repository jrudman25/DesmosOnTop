document.addEventListener('DOMContentLoaded', () => {
  const calcMode = document.getElementById('calc-mode');
  const desmosFrame = document.getElementById('desmos-frame');
  const pipToggle = document.getElementById('pip-toggle');

  // Mode switching
  calcMode.addEventListener('change', () => {
    desmosFrame.src = calcMode.value;
  });

  // Document PiP support
  const pipSupported = 'documentPictureInPicture' in window;

  if (!pipSupported) {
    pipToggle.disabled = true;
    pipToggle.title = 'Picture-in-Picture requires Chrome 116+';
  }

  pipToggle.addEventListener('click', async () => {
    if (!pipSupported) return;

    try {
      const pipWindow = await documentPictureInPicture.requestWindow({
        width: 480,
        height: 640,
        disallowReturnToOpener: true
      });

      const doc = pipWindow.document;

      // Styles for the PiP window
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
          border-bottom: 1px solid rgba(45, 112, 179, 0.25);
          height: 36px;
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
          border: 1px solid rgba(45, 112, 179, 0.25);
          border-radius: 4px;
          padding: 2px 6px;
          cursor: pointer;
        }
        .calc-select:focus { outline: 1px solid #2d70b3; }
        iframe { width: 100%; height: calc(100% - 36px); border: none; }
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
        if (m.value === calcMode.value) opt.selected = true;
        select.appendChild(opt);
      });

      toolbar.appendChild(title);
      toolbar.appendChild(select);
      doc.body.appendChild(toolbar);

      // Desmos iframe in PiP
      const iframe = doc.createElement('iframe');
      iframe.src = calcMode.value;
      iframe.allow = 'clipboard-write';
      doc.body.appendChild(iframe);

      // Mode switching in PiP
      select.addEventListener('change', () => {
        iframe.src = select.value;
      });

      // Close the original calculator window since PiP is now active
      window.close();
    } catch (err) {
      console.error('PiP failed:', err);
    }
  });
});
