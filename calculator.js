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

  // Shared function to launch PiP from this page context
  async function launchPiP() {
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
          border: 1px solid rgba(45, 112, 179, 0.25);
          border-radius: 4px;
          padding: 2px 6px;
          cursor: pointer;
          -webkit-app-region: no-drag;
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

      // Hide the calculator content and show a status message.
      // The opener window MUST stay alive — PiP windows are destroyed
      // when their opener document is closed.
      document.querySelector('.toolbar').style.display = 'none';
      desmosFrame.style.display = 'none';

      let status = document.getElementById('pip-status');
      if (!status) {
        status = document.createElement('div');
        status.id = 'pip-status';
        status.className = 'pip-status';
        status.innerHTML = `
          <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="#7eb8e6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="6" width="40" height="28" rx="4"/>
            <rect x="24" y="18" width="16" height="12" rx="2" fill="#2d70b3" opacity="0.3"/>
            <path d="M16 42h16M24 34v8"/>
          </svg>
          <p>Calculator is floating!</p>
          <span>You can minimize this window. Closing it will end the float.</span>
        `;
        document.body.appendChild(status);
      }

      // When PiP is closed, restore the calculator
      pipWindow.addEventListener('pagehide', () => {
        document.querySelector('.toolbar').style.display = '';
        desmosFrame.style.display = '';
        if (status) status.remove();
      });
    } catch (err) {
      console.error('PiP failed:', err);
    }
  }

  // Toolbar Float button
  pipToggle.addEventListener('click', launchPiP);

  // Auto-PiP mode: when opened with ?pip=1, show a click-to-float overlay
  // (Document PiP requires a user gesture, so we need one click)
  const params = new URLSearchParams(window.location.search);
  if (params.get('pip') === '1' && pipSupported) {
    const overlay = document.createElement('div');
    overlay.className = 'pip-overlay';
    overlay.innerHTML = `
      <div class="pip-overlay-content">
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#7eb8e6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="6" width="40" height="28" rx="4"/>
          <rect x="24" y="18" width="16" height="12" rx="2" fill="#2d70b3" opacity="0.3"/>
          <path d="M16 42h16M24 34v8"/>
        </svg>
        <p>Click anywhere to float on top</p>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
      overlay.remove();
      launchPiP();
    });
  }
});
