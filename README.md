# Go Whiteboard

A cross-platform desktop whiteboard application built with [Go](https://go.dev) and [Wails](https://wails.io).

## Features

- **Drawing Tools** — Pencil, eraser, line, rectangle, and circle
- **Color Picker** — Custom color picker with 12 preset colors
- **Adjustable Stroke** — Brush size slider (1–30px)
- **Undo** — Step backwards through your drawing history
- **Clear All** — Wipe the entire canvas
- **Multi‑Tab** — Create, switch, and close multiple whiteboard tabs
- **Save as PNG** — Native save dialog (OS‑native file picker)
- **Touch Support** — Works with touch input on tablets

## Requirements

- [Go](https://go.dev/dl/) 1.22+
- [Wails](https://wails.io/docs/gettingstarted/installation) v2
- Linux: standard build toolchain (`gcc`, `libgtk-3-dev`, `libwebkit2gtk-4.0-dev`)
- macOS: Xcode Command Line Tools
- Windows: Visual Studio Build Tools + WebView2

## Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/go-whiteboard.git
cd go-whiteboard

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run in development mode (hot reload)
wails dev

# Build for production
wails build
```

The binary will be placed in `build/bin/`.

## Project Structure

```
go-whiteboard/
├── app.go              # Go backend (save dialog)
├── main.go             # Wails application entry point
├── wails.json          # Wails configuration
├── frontend/
│   ├── index.html      # HTML entry point
│   ├── package.json    # Frontend dependencies
│   └── src/
│       ├── main.js     # Whiteboard logic (tools, canvas, tabs)
│       ├── style.css   # Global styles
│       └── app.css     # Whiteboard-specific styles
└── build/              # Build output
```

## How It Works

The canvas uses an HTML5 Canvas element with a two‑layer approach:
- **Main canvas** — renders all committed strokes
- **Overlay canvas** — shows the current shape preview while dragging

Strokes are stored per tab as an array of objects and re‑rendered on every frame, making undo and tab switching straightforward.

The Go backend exposes a single `SaveCanvas(dataURL)` method, which decodes a base64 PNG data URL and writes it to disk via Wails' native save dialog.

## License

MIT
