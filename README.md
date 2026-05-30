# 💻 DevRoom.OS — 3D Isometric Developer Room & macOS Portfolio

An immersive, state-of-the-art interactive **3D Isometric Software Developer's Room** built using **Three.js**, **Vite**, and **Vanilla Javascript/CSS**. The project features a cozy workspace with fully interactive furniture, mechanical soundscapes, ambient Day/Night cycles, and a custom macOS-inspired portfolio OS containing the professional achievements, projects, and credentials of **Harsh Pratap Singh**.

---

## 🚀 Interactive Features & Highlights

### 🖥️ 1. Zoomable macOS Portfolio Desktop
* **Main Screen Activation**: Clicking on the **Main Center Curved Monitor** triggers a camera zoom into a high-end virtual macOS desktop session.
* **Mac Startup Chime Synth**: Plays a retro **Web Audio API synthesized startup chime**—composing a warm F# major chord across multiple detuned triangle/sine oscillators with vintage chorus depth.
* **Responsive Window Manager**: Double-click standard shortcut icons on the desktop to launch glassmorphic window panes:
  - **About Me.app**: Background bio, profile, and interactive core technology tag chips.
  - **Projects.app**: Elegant layout presenting high-end Full-Stack projects (*Adhyan LMS*, *FinDash*, *Harvex Studio*).
  - **Resume.pdf**: Interactive career timeline showing education (IIIT Ranchi) and work experience (Codingal, CodePen.io).
  - **Contact.app**: A responsive letter prompt for visitors to message the developer.
* **Bouncing macOS Dock**: Bouncing trays containing system shortcuts, active indicators, and a **Shut Down** button that terminates the remote session and returns the camera to the room overview.

### 🖼️ 2. Aspect-Ratio Corrected Photo Frames
* **Museum-Grade Layout**: Holds high-fidelity custom portrait and landscape frames on the walls with sleek black frames and white passe-partout mat boards.
* **Calibrated Dimensions**: Pre-parsed image dimensions are mathematically mapped to specific mesh geometries to completely eliminate squishing or stretching:
  - **`kiddo.jpg` (Left Wall)**: 9:16 aspect ratio (`0.52` width × `0.80` height).
  - **`kiddo2.png` (Right Wall)**: 2:3 portrait ratio (`0.76` width × `1.06` height).
  - **`kiddo3.png` (Right Wall)**: 3:2 landscape ratio (`1.06` width × `0.76` height).

### 🌸 3. Pure Floating "Lucida Calligraphy" Neon sign
* **Magical Suspension**: A self-luminous calligraphic text sign reading *"Meri Choti si kiddo"* floats in air above the frames at `Y = 2.75` (all black mounting wires, rails, and brackets removed).
* **High-Contrast Glow**: Rendered procedurally on a 1024x256 high-resolution canvas with Lucida Calligraphy font. Uses multi-layered strokes with a cleared shadowBlur before drawing the final core to maintain **perfectly crisp letter edges** and avoid glow washout.
* **Day Mode Shut Down**: When toggling Day Mode, the neon sign smoothly fades its opacity to `0.0` and turns its `visible` property to `false` to completely power down, and fully ignites back to `1.0` in Night Mode.

### 🌙 4. Physical Window Cutout & Dynamic Skylines
* **Segmented Left Wall**: The solid wall is segmented into 4 mathematically aligned blocks, creating a real rectangular cutout opening (`2.4 width x 1.8 height`) centered at `Y = 2.0, Z = 1.0`.
* **Double-Pane Glass**: Includes a reflective window glass pane (`MeshPhysicalMaterial`) featuring light transmission and roughness variables to catch cozy indoor light reflections.
* **Cozy Night sky & Moon**: Features a glowing golden moon in the sky. During Day/Night transitions, the sky color shifts from **midnight blue (`0x05081c`)** to **bright sky blue (`0xbae6fd`)**, the moon opacity fades away, and the yellow skyscraper windows automatically turn off/on.

### 🔊 5. Real-time Audio Synthesis & HUD Terminal
* **No Audio Samples**: Synthesizes all soundscapes procedurally in real-time utilizing the **Web Audio API**:
  - **PC Hum**: Mix of a low 60Hz hum, fan blade resonance, and bandpass air noise.
  - **Mech Clicks**: Low-frequency triangle pop combined with high-frequency high-pass spring noise.
  - **Cozy Rain**: Cozy rain noise layered with low-frequency random thunder rumbles.
* **Interactive CLI Terminal**: Control the room using the dev HUD bash console:
  - `/lamp` — Toggle warm desk lamp.
  - `/coffee` — Refill coffee and spawn steam particles.
  - `/day` & `/night` — Transition theme lighting.
  - `/focus [desk|shelf|window|overview]` — Focus camera.
  - `/pc` — Boot/shutdown the system core.
  - `/clear` — Clear CLI logs.
* **Layout Integrity**: Incorporates Flexbox and Grid boundaries (`min-height: 0`) to keep the CLI input box permanently locked and visible at the bottom of the right panel, regardless of log history.

---

## 🛠️ Architecture & Directory Structure

```bash
roomisometric/
├── index.html            # Entrypoint. Houses glassmorphic HUD overlays & macOS desktop structure.
├── package.json          # Dependency definition (Three.js & Vite build engine).
├── public/               # Public assets (photos, images, and static resources).
│   ├── kiddo.jpg
│   ├── kiddo2.png
│   └── kiddo3.png
├── src/
│   ├── main.js           # Engine Coordinator: Renderer, camera, shadows, ticking loops, controls.
│   ├── room.js           # 3D Assets: Furniture geometries, wood floor textures, aspect frames, neon canvas.
│   ├── interactions.js   # Interactive Logic: Web Audio synth clicks/hums/chimes, Day/Night lerps, camera focus.
│   └── style.css         # Styling system: Glassmorphism tokens, CSS layouts, and macOS window styles.
└── README.md             # Project documentation.
```

---

## 💻 Technical Stack

* **Core Rendering**: Three.js (WebGL 3D engine)
* **Build Engine**: Vite (Instant bundling & development server)
* **Synthesizer & Audio**: Web Audio API (Live oscillator sound synthesis)
* **Styling**: Modern CSS (Vanilla flexbox/grid layout and glassmorphism)
* **Typography**: Outfit (UI Headers) & JetBrains Mono (Terminal / macOS font)

---

## ⚙️ Installation & Running Locally

Ensure you have **Node.js** (v18 or higher) installed on your machine.

### 1. Clone & Navigate to Project
```powershell
cd "d:\Finished WebDev Projects\roomisometric"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
*Open your browser and navigate to the local URL printed in the terminal console (typically `http://localhost:5173`).*

### 4. Build Production Bundle
To compile and package the project for production deployment:
```bash
npm run build
```
*The optimized minified production bundle will be generated inside the `dist/` directory.*

---

## 👤 Developer Profile
* **Name**: Harsh Pratap Singh
* **Email**: [prataph229@gmail.com](mailto:prataph229@gmail.com)
* **Phone**: [+91-8630989515](tel:+91-8630989515)
* **Stack**: C++, Python, TypeScript, React/Next, Node/Express, Three.js, WebRTC, Socket.io, GSAP.
