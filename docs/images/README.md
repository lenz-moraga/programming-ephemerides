# docs/images

This folder holds screenshots, GIFs, and diagrams that are referenced in the README.

## Required assets

| File | Description | How to capture |
|------|-------------|----------------|
| `demo.gif` | Animated GIF showing the main page loading and the typing animation | Use [ScreenToGif](https://www.screentogif.com/) (Windows) or [Gifski](https://gif.ski/) (macOS/Linux). Open the app at `http://localhost:3000`, record a 5–10 second clip of the terminal animation, and export as `demo.gif`. |
| `screenshot-home.png` | Static screenshot of the main terminal UI | Open `http://localhost:3000`, press `F12 → Ctrl+Shift+P → Screenshot` in Chrome DevTools, or use your OS screenshot tool. |
| `screenshot-dark.png` | Main page in dark mode | Same as above but with dark theme active. |

## Recommended dimensions

- Screenshots: **1280×800** or **1440×900** (16:9)
- GIF: keep under **3 MB** for fast README loading; reduce frame rate to 10–15 fps if needed.

## Quick capture tips

```bash
# macOS — full page screenshot with Puppeteer (requires Node.js)
npx puppeteer screenshot --url http://localhost:3000 --output docs/images/screenshot-home.png

# Linux — capture with gnome-screenshot
gnome-screenshot -w -f docs/images/screenshot-home.png
```

Once you have the files in this folder, the README badges and image tags will automatically display them on GitHub.
