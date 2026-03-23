# 🎹 Piano Pro: Premium Edition

> A sleek, highly authentic 2D digital instrument featuring our custom Ivory & Onyx design system.

Turn your computer keyboard into a fully functional piano. Leveraging the power of the **Web Audio API (Tone.js)**, this project delivers a highly responsive, low-latency performance interface directly in the browser—stripped of all unnecessary distractions for a pristine monochrome aesthetic.

---

## ✨ Features

- **Monochrome Precision UI:** A minimalistic, authentic black-and-white 2D interface using the "Ivory & Onyx" design system (no rounded corners, sharp contrast).
- **High-Fidelity Audio:** Realistic piano sound generation using Tone.js, supporting full polyphony.
- **Intuitive Key Mapping:** 
  - **Alphabet (A-Z)** mapped sequentially to **White Keys**.
  - **Numbers (0-9)** mapped sequentially to **Black Keys**.
- **Studio Controls:** 
  - **Volume Slider** for precision master gain control.
  - **Record & Playback Engine** to capture and seamlessly recreate your performances dynamically.
- **Auto-Sync Script:** Included `autopush.py` utility for automatically tracking and pushing changes to GitHub.

---

## 🏗 Tech Stack

- **[React 19](https://react.dev/)** - UI library for building the application structure.
- **[Tone.js](https://tonejs.github.io/)** - High-performance Web Audio framework for precise sound synthesis and component scheduling.
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling utilized for the high-end monolithic layout logic.
- **[Vite](https://vitejs.dev/)** - Lightning-fast frontend build tool and development server.

---

## 🚀 Getting Started

Follow these steps to run Piano Pro locally:

### 1. Install Dependencies

Ensure you have [Node.js](https://nodejs.org/) installed, then run the following command in the project root:

```bash
npm install
```

### 2. Start the Development Server

Launch the Vite development server:

```bash
npm run dev
```

Your browser should automatically open to `http://localhost:5173`.

### 3. Build for Production

To create an optimized production build:

```bash
npm run build
```

---

*Enjoy the music!* 🎶
