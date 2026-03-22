# 🎹 3D Piano Experience

> A premium, cinematic browser-based piano designed for learning, practice, and performance.

Turn your computer keyboard into a fully functional piano. Leveraging the power of **Web Audio API** and **Three.js**, this project delivers a highly immersive, low-latency audio-visual experience directly in the browser. 

---

## ✨ Features

- **Stunning 3D Visuals:** A sleek, dark-themed cinematic environment with responsive 3D piano keys built using React Three Fiber.
- **High-Fidelity Audio:** Realistic piano sound generation using Tone.js, with support for polyphony and pedal effects.
- **Three Progressive Modes:**
  - **Beginner:** Guided learning and interactive tutorials.
  - **Intermediate:** Focus on scales, chords, and multi-octave polyphony.
  - **Expert:** Advanced studio tools and metronome integration.
- **Keyboard Mapping:** Play using your computer keyboard with an intuitive map for multi-octave reach.

---

## 🏗 Tech Stack

- **[React 19](https://react.dev/)** - UI library for building the application structure.
- **[Three.js](https://threejs.org/) & [React Three Fiber](https://r3f.docs.pmnd.rs/)** - For rendering the immersive 3D piano keyboard and cinematic backgrounds.
- **[Tone.js](https://tonejs.github.io/)** - High-performance Web Audio framework for precise sound synthesis and scheduling.
- **[Tailwind CSS](https://tailwindcss.com/)** - For rapid, utility-first styling and premium typography.
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management for tracking currently pressed keys and modes.
- **[Vite](https://vitejs.dev/)** - Lightning-fast frontend build tool and development server.

---

## 📂 Project Structure

```bash
3d-piano/
├── src/
│   ├── assets/       # Static assets, fonts, and icons
│   ├── audio/        # Tone.js engine and audio synthesis logic
│   ├── components/   # React components (Scene3D, PianoKeyboard3D, Overlays)
│   ├── constants/    # Configuration modes and keyboard mappings
│   ├── hooks/        # Custom React hooks (e.g., usePianoEvents)
│   ├── store/        # Zustand state definitions
│   ├── utils/        # Helper functions
│   ├── App.jsx       # Main application shell and routing
│   └── index.css     # Global styles and Tailwind imports
├── public/           # Publicly served assets
└── package.json      # Dependencies and scripts
```

---

## 🚀 Getting Started

Follow these steps to run the 3D Piano experience locally:

### 1. Install Dependencies

Ensure you have [Node.js](https://nodejs.org/) installed. Run the following command in the project root:

```bash
npm install
```

### 2. Start the Development Server

Launch the Vite development server:

```bash
npm run dev
```

Your browser should automatically open to `http://localhost:5173`. Alternatively, you can click the link provided in your terminal.

### 3. Build for Production

To create an optimized production build:

```bash
npm run build
```

You can preview the production build using:

```bash
npm run preview
```

---

*Enjoy playing the piano!* 🎶
