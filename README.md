# Slidefy

A Tinder-style swipe interface for curating music playlists and previewing tracks.

Slide right to keep a track in your playlist, slide left to remove it. Built as an autonomous client-side portfolio demonstration with fluid gestures, responsive layouts, dynamic Ambilight backgrounds, and 30-second audio previews.

## Features

- **Card Swiping Mechanics:** 60fps gesture-driven card interactions powered by Framer Motion with directional tilt, stamp indicators, and keyboard shortcuts.
- **Audio Previews:** 30-second audio playback with synchronized progress bar, seek controls, and volume adjustments.
- **Dynamic Ambilight Background:** Real-time canvas color extraction from album covers that dynamically adapts the page gradient.
- **Spoti Stats:** Listening analytics view displaying top tracks and artists across 4-week, 6-month, and all-time periods.
- **Playlist Management:** Create custom playlists directly from top tracks and manage existing playlists with local persistence.

## Tech Stack

- **Frontend:** React 19, Framer Motion 12, Tailwind CSS
- **Audio & Media:** HTML5 Web Audio, Apple iTunes Search API (preview streaming & artwork)
- **Data Layer:** Client-side mock adapter intercepting API calls with `localStorage` state persistence

## Getting Started

### Prerequisites

Node.js 18+ and npm installed on your system.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/budziun/slidefy-demo.git
cd slidefy-demo
npm run build --prefix client
```

Or install inside `client/`:

```bash
cd client
npm install
npm start
```

### Running Locally

To start the development server:

```bash
npm start
```

Open `http://localhost:3000` in your browser.

### Production Build

To generate the optimized production bundle:

```bash
npm run build
```

The compiled assets will be placed in `client/build/`, ready for static deployment to GitHub Pages, Vercel, Netlify, or any static host.

## License

MIT License. Designed and built by [Jakub Budzich](https://budziun.pl).

