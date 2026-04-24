chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-calculator') {
    chrome.windows.create({
      url: chrome.runtime.getURL('calculator.html'),
      type: 'popup',
      width: 520,
      height: 700,
      focused: true
    });
  }
});
