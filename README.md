# Desmos Floating Calculator — Chrome Extension

A Chrome extension that provides a floating, always-on-top Desmos calculator using the Document Picture-in-Picture API.

![Icon](icons/icon128.png)

## Features

- **Float on Top (PiP)** — Opens Desmos in a Picture-in-Picture window that stays on top of all other browser windows
- **Popup Window** — Alternative mode that opens Desmos in a resizable Chrome popup window
- **Multiple Calculator Modes** — Switch between Graphing, Scientific, Basic, Matrix, and Geometry calculators
- **Dark themed toolbar** — Minimal UI that stays out of the way

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `desmosontop` folder
5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon in your Chrome toolbar
2. Choose one of two launch modes:
   - **Open Calculator Window** — Opens a resizable popup window with Desmos
   - **Float on Top (PiP)** — Opens Desmos in an always-on-top Picture-in-Picture window
3. Use the dropdown in the toolbar to switch between calculator types

## Requirements

- **Chrome 116+** for Document Picture-in-Picture support
- The "Open Calculator Window" fallback works on any Chrome version

## Project Structure

```
desmosontop/
├── manifest.json        # Extension manifest (MV3)
├── popup.html/css/js    # Extension popup (click icon)
├── calculator.html/css/js  # Calculator page with PiP toggle
├── icons/               # Extension icons (16, 48, 128px)
├── generate-icons.js    # Icon generator script (dev only)
└── README.md
```
