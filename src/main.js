/**
 * main.js
 * Central coordinator for the Three.js 3D Isometric Room engine.
 * Sets up renderer, camera, lights, controls, raycasting, and HUD interface.
 */

import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import {
  buildRoom,
  interactiveMeshes,
  materialsCache,
  focusPositions,
  tickProceduralTextures
} from './room.js';

import {
  setThreeRef,
  setThemeMode,
  toggleRain,
  togglePcHum,
  playKeyboardClick,
  playLampClick,
  playPcBeep,
  setKeyboardSound,
  updateSteamParticles,
  lerpTheme,
  ThemeConfig,
  playMacChime
} from './interactions.js';

// Core Three.js variables
let scene, camera, renderer, controls;
let clock;

// Lights references
const lights = {
  ambient: null,
  directional: null,
  deskLamp: null,
  pcGlow: null,
  scene: null // scene ref for background/fog
};

// Object Position Caches
let coffeeCupPos = new THREE.Vector3();
let chairGroupRef = null;

// Camera animation state
let targetCamPos = new THREE.Vector3(7, 5.7, 7);
let targetLookAt = new THREE.Vector3(0, 0.5, 0);
let isAnimatingCamera = false;

// Chair spin animation state
let chairRotationSpeed = 0;
let isPcBooted = true;
let isLampOn = true;

// UI elements references
let btnToggle, termInput, termLog, statCpu, statMem;

/**
 * 1. INITIALIZE THREE.JS APP
 */
function init() {
  // Pass THREE reference to interactions
  setThreeRef(THREE);

  clock = new THREE.Clock();

  // Create Scene with deep night fog by default
  scene = new THREE.Scene();
  scene.background = new THREE.Color(ThemeConfig.spaceBg.night);
  scene.fog = new THREE.FogExp2(ThemeConfig.spaceBg.night, 0.025);
  lights.scene = scene;

  // Renderer Setup
  const canvas = document.querySelector('#webgl');
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.0;

  // Orthographic Isometric Camera Setup
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 4.2;
  camera = new THREE.OrthographicCamera(
    -frustumSize * aspect,
    frustumSize * aspect,
    frustumSize,
    -frustumSize,
    0.1,
    100
  );
  
  // High isometric perspective angle (45 deg horizontal tilt, ~35.26 deg vertical tilt)
  camera.position.set(7, 5.7, 7);
  camera.lookAt(0, 0.5, 0);

  // OrbitControls Setup
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0.5, 0);
  
  // Restrictions to prevent clipping under floor or zooming too far
  controls.minZoom = 0.45;
  controls.maxZoom = 3.5;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // limit looking from under floor
  controls.minPolarAngle = 0.1;
  controls.enablePan = true;
  
  // Clamp panning to keep room centered
  controls.addEventListener('change', () => {
    const maxPan = 3.5;
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -maxPan, maxPan);
    controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0, maxPan);
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -maxPan, maxPan);
  });

  /**
   * 2. LIGHTING SETUP
   */
  // A. Soft Ambient Light
  lights.ambient = new THREE.AmbientLight(ThemeConfig.ambientLight.color.night, ThemeConfig.ambientLight.intensity.night);
  scene.add(lights.ambient);

  // B. Directional Moonlight (shadow casting)
  lights.directional = new THREE.DirectionalLight(ThemeConfig.dirLight.color.night, ThemeConfig.dirLight.intensity.night);
  lights.directional.position.set(ThemeConfig.dirLight.pos.night.x, ThemeConfig.dirLight.pos.night.y, ThemeConfig.dirLight.pos.night.z);
  lights.directional.castShadow = true;
  
  // Calibrate high-res shadow mapping
  lights.directional.shadow.mapSize.width = 2048;
  lights.directional.shadow.mapSize.height = 2048;
  lights.directional.shadow.camera.left = -5;
  lights.directional.shadow.camera.right = 5;
  lights.directional.shadow.camera.top = 5;
  lights.directional.shadow.camera.bottom = -5;
  lights.directional.shadow.camera.near = 0.5;
  lights.directional.shadow.camera.far = 25;
  lights.directional.shadow.bias = -0.0004;
  scene.add(lights.directional);

  // C. Interactive Warm Desk Lamp PointLight
  lights.deskLamp = new THREE.PointLight(ThemeConfig.lampLight.color, ThemeConfig.lampLight.intensityOn.night, 3.5, 2.0);
  lights.deskLamp.position.set(-1.6, 1.45, -1.35); // centered above keyboard area
  lights.deskLamp.castShadow = true;
  lights.deskLamp.shadow.mapSize.width = 512;
  lights.deskLamp.shadow.mapSize.height = 512;
  lights.deskLamp.shadow.bias = -0.002;
  lights.deskLamp.userData.isOn = true;
  scene.add(lights.deskLamp);

  // D. Local PC glowing PointLight (soft cyan/purple glow inside case)
  lights.pcGlow = new THREE.PointLight(0x00f2fe, 1.8, 1.5, 1.5);
  lights.pcGlow.position.set(-2.4, 1.1, -0.85);
  lights.pcGlow.castShadow = false;
  scene.add(lights.pcGlow);

  /**
   * 3. MODEL ROOM BUILDING
   */
  const roomMesh = buildRoom(THREE, scene);
  
  // Find key group references from room building
  roomMesh.traverse(child => {
    // Cache coffee cup global position for particle spawning
    if (child === interactiveMeshes.coffeeMug) {
      child.getWorldPosition(coffeeCupPos);
    }
    // Chair reference
    if (child.name === 'chairGroup' || (child.parent && child.parent.parent && child.parent.parent.parent && child.parent.parent.parent.parent === scene && child.parent.parent.parent.name === 'chairGroup')) {
      // Find base chair group structure
    }
  });

  // Since chairGroup is a child of roomMesh, let's look for the first child group that is the chair
  roomMesh.children.forEach(child => {
    if (child.children.includes(interactiveMeshes.chair)) {
      chairGroupRef = child;
    }
  });

  // Enable standard raycasting pointers
  setupRaycaster();
  
  // Bind all HTML dashboard controls
  bindControls();

  // Run render loop
  animate();
}

/**
 * 4. RAYCASTER & INTERACTION MOUSE EVENTS
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function setupRaycaster() {
  window.addEventListener('click', onDocumentMouseDown);
  window.addEventListener('mousemove', onDocumentMouseMove);
}

function onDocumentMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Map interactive components lists
  const targets = Object.values(interactiveMeshes).filter(Boolean);
  const intersects = raycaster.intersectObjects(targets, true);

  if (intersects.length > 0) {
    document.body.style.cursor = 'pointer';
  } else {
    document.body.style.cursor = 'default';
  }
}

function onDocumentMouseDown(event) {
  // Ignore clicks on floating HUD panels
  if (event.target.closest('.hud-panel') || event.target.closest('.hud-footer')) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const targets = Object.values(interactiveMeshes).filter(Boolean);
  const intersects = raycaster.intersectObjects(targets, true);

  if (intersects.length > 0) {
    // Identify which key component was clicked
    let hitObject = intersects[0].object;

    // Traverse upwards to see if it belongs to one of our key groups
    let match = null;
    Object.entries(interactiveMeshes).forEach(([key, val]) => {
      if (val === hitObject || (val && val.parent && val.parent.children.includes(hitObject)) || (val && val.children && val.children.includes(hitObject))) {
        match = key;
      }
    });

    if (!match) {
      // Direct compare fallback
      if (hitObject === interactiveMeshes.lamp) match = 'lamp';
      else if (hitObject === interactiveMeshes.pc) match = 'pc';
      else if (hitObject === interactiveMeshes.keyboard) match = 'keyboard';
      else if (hitObject === interactiveMeshes.coffeeMug) match = 'coffeeMug';
      else if (hitObject === interactiveMeshes.chair) match = 'chair';
    }

    if (match) {
      triggerObjectAction(match);
    }
  }
}

/**
 * Trigger explicit actions on 3D components
 */
function triggerObjectAction(name) {
  switch (name) {
    case 'lamp':
      isLampOn = !isLampOn;
      lights.deskLamp.userData.isOn = isLampOn;
      lights.deskLamp.intensity = isLampOn 
        ? (btnToggle.classList.contains('mode-night') ? ThemeConfig.lampLight.intensityOn.night : ThemeConfig.lampLight.intensityOn.day)
        : 0;
      
      playLampClick();
      printTerminalLog(`> Toggle desk lamp: ${isLampOn ? 'ON' : 'OFF'}`, 'text-cyan');
      break;

    case 'pc':
      isPcBooted = !isPcBooted;
      playPcBeep();
      
      // Toggle RGB fans and inner glow
      if (isPcBooted) {
        togglePcHum(document.getElementById('sound-pc').checked);
        lights.pcGlow.intensity = 1.8;
        if (materialsCache.rgbLed) materialsCache.rgbLed.emissiveIntensity = 1.8;
        printTerminalLog(`> Booting system core... OK. Fans active.`, 'success');
      } else {
        togglePcHum(false);
        lights.pcGlow.intensity = 0;
        if (materialsCache.rgbLed) materialsCache.rgbLed.emissiveIntensity = 0.05;
        printTerminalLog(`> Shutting down system graphics core. Sleep mode.`, 'error');
      }
      break;

    case 'keyboard':
      playKeyboardClick();
      // Generate some funny developer keystroke logs
      const codeSnippets = [
        "const dev = new SoftwareDeveloper({ coffee: 'hot' });",
        "npm run build --minify --force",
        "git commit -m 'Fixed bug by adding a semi-colon, don't ask'",
        "docker-compose up -d --build",
        "rm -rf node_modules && npm install",
        "Response 200 OK - Compiled in 48ms."
      ];
      const randomCode = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      printTerminalLog(`devroom ~ ${randomCode}`);
      break;

    case 'coffeeMug':
      playLampClick(); // cute click sound for mug
      updateSteamParticles(scene, coffeeCupPos); // manual burst trigger
      printTerminalLog(`> Coffee level refilled to 100%. Heart rate warning initialized.`, 'text-magenta');
      break;

    case 'chair':
      // Give the chair a smooth spinning force!
      chairRotationSpeed = 8.0; 
      playKeyboardClick(); // soft pop sound
      printTerminalLog(`> Spinning ergonomic task chair. WHEEE!`);
      break;

    case 'mainScreen':
      // 1. Zoom and focus on center screen
      triggerCameraFocus('screenFocus');
      playMacChime();
      printTerminalLog(`> Zooming camera to screen focus matrix.`, 'text-cyan');
      printTerminalLog(`> Booting macOS Remote Desktop session...`, 'text-magenta');
      
      // 2. Fade visual HUD overlays
      setTimeout(() => {
        const hud = document.getElementById('hud-container');
        hud.style.opacity = 0;
        hud.style.pointerEvents = 'none';

        const macOs = document.getElementById('macos-desktop');
        macOs.classList.remove('hidden-os');
      }, 700);
      break;
  }
}

/**
 * 5. BIND HTML INTERFACE CONTROLS & TERMINAL COMMANDS
 */
function bindControls() {
  btnToggle = document.getElementById('day-night-toggle');
  termInput = document.getElementById('terminal-input');
  termLog = document.getElementById('terminal-log');
  statCpu = document.getElementById('stat-cpu');
  statMem = document.getElementById('stat-mem');

  // Time of Day Toggle Click
  btnToggle.addEventListener('click', () => {
    if (btnToggle.classList.contains('mode-night')) {
      // Transition to Day
      btnToggle.classList.remove('mode-night');
      btnToggle.classList.add('mode-day');
      btnToggle.innerHTML = '<span class="btn-icon">☀️</span><span class="btn-text">DAY MODE</span>';
      setThemeMode('day');
      printTerminalLog('> System Theme Shift: SCANDINAVIAN_DAYLIGHT active.', 'text-cyan');
    } else {
      // Transition to Night
      btnToggle.classList.remove('mode-day');
      btnToggle.classList.add('mode-night');
      btnToggle.innerHTML = '<span class="btn-icon">🌙</span><span class="btn-text">NIGHT MODE</span>';
      setThemeMode('night');
      printTerminalLog('> System Theme Shift: CYBERPUNK_NIGHT active.', 'text-cyan');
    }
    
    // Recalibrate lamp intensity based on new time of day standard
    setTimeout(() => {
      if (isLampOn) {
        lights.deskLamp.intensity = btnToggle.classList.contains('mode-night')
          ? ThemeConfig.lampLight.intensityOn.night
          : ThemeConfig.lampLight.intensityOn.day;
      }
    }, 100);
  });

  // Soundscape toggles
  document.getElementById('sound-rain').addEventListener('change', (e) => {
    toggleRain(e.target.checked);
    printTerminalLog(`> Cozy rain ambient layer: ${e.target.checked ? 'ENABLED' : 'MUTED'}`);
  });

  document.getElementById('sound-pc').addEventListener('change', (e) => {
    if (isPcBooted) {
      togglePcHum(e.target.checked);
    }
    printTerminalLog(`> PC chassis ventilation sound: ${e.target.checked ? 'ENABLED' : 'MUTED'}`);
  });

  document.getElementById('sound-keys').addEventListener('change', (e) => {
    setKeyboardSound(e.target.checked);
    printTerminalLog(`> Mechanical keyboard clicks: ${e.target.checked ? 'ENABLED' : 'MUTED'}`);
  });

  // Camera Quick view Presets
  const viewButtons = document.querySelectorAll('.btn-view');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const targetView = btn.getAttribute('data-view');
      triggerCameraFocus(targetView);
    });
  });

  // Terminal input parser
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmdText = termInput.value.trim();
      termInput.value = '';
      if (cmdText) {
        executeTerminalCommand(cmdText);
      }
    }
  });

  // Periodically update simulated CPU / RAM metrics in HUD
  setInterval(() => {
    const cpu = (8.0 + Math.sin(Date.now() * 0.001) * 4.0 + (isPcBooted ? Math.random() * 8.0 : 0)).toFixed(1);
    const mem = (8.1 + Math.cos(Date.now() * 0.0005) * 0.4 + (isPcBooted ? 0.3 : -0.8)).toFixed(1);
    
    statCpu.innerText = `${cpu}%`;
    statMem.innerText = `${mem} GB`;
    
    const statusLabel = document.getElementById('stat-status');
    if (cpu > 25) {
      statusLabel.className = 'status-warning';
      statusLabel.innerText = 'HEAVY LOAD';
    } else {
      statusLabel.className = 'status-stable';
      statusLabel.innerText = 'STABLE';
    }
  }, 1500);

  // --- macOS INTERACTIVE PORTFOLIO BINDINGS ---
  // A. macOS Shut Down trigger (Return to 3D Space)
  const triggerShutdown = () => {
    playLampClick(); // soft click sound
    document.getElementById('macos-desktop').classList.add('hidden-os');
    
    // Fade in room HUD
    const hud = document.getElementById('hud-container');
    hud.style.opacity = 1;
    hud.style.pointerEvents = 'auto';
    
    // Focus camera back to overview
    triggerCameraFocus('overview');
    
    // Sync view buttons
    document.querySelectorAll('.btn-view').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-view-overview').classList.add('active');

    printTerminalLog(`> macOS remote session terminated. Returned to Room OS.`, 'text-magenta');
  };

  document.getElementById('dock-shutdown').addEventListener('click', triggerShutdown);
  document.getElementById('mac-apple-menu').addEventListener('click', triggerShutdown);

  // B. Window Open/Focus bindings (icons + dock)
  const shortcuts = document.querySelectorAll('.shortcut-icon, .dock-item[data-open]');
  shortcuts.forEach(shortcut => {
    shortcut.addEventListener('click', () => {
      const winId = shortcut.getAttribute('data-open');
      if (winId) {
        playKeyboardClick();
        
        const win = document.getElementById(winId);
        if (win) {
          // Bring selected window to front
          document.querySelectorAll('.mac-window').forEach(w => {
            w.style.zIndex = 1020;
          });
          win.style.zIndex = 1025;
          win.classList.remove('hidden-window');
        }
      }
    });
  });

  // C. Window Close bindings
  const closeBtns = document.querySelectorAll('.win-btn.close');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const winId = btn.getAttribute('data-close');
      if (winId) {
        playKeyboardClick();
        const win = document.getElementById(winId);
        if (win) {
          win.classList.add('hidden-window');
        }
      }
    });
  });

  // D. Menu Bar navigation shortcuts
  document.getElementById('menu-about').addEventListener('click', () => {
    document.querySelector('.dock-item[data-open="win-about"]').click();
  });
  document.getElementById('menu-projects').addEventListener('click', () => {
    document.querySelector('.dock-item[data-open="win-projects"]').click();
  });
  document.getElementById('menu-resume').addEventListener('click', () => {
    document.querySelector('.dock-item[data-open="win-resume"]').click();
  });
  document.getElementById('menu-contact').addEventListener('click', () => {
    document.querySelector('.dock-item[data-open="win-contact"]').click();
  });

  // E. Real-time Clock updating (Shows Sat May 30 10:14 AM like real macOS)
  const updateMacClock = () => {
    const clockEl = document.getElementById('mac-clock');
    if (clockEl) {
      const d = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const dayName = days[d.getDay()];
      const monthName = months[d.getMonth()];
      const dateNum = d.getDate();
      
      let hrs = d.getHours();
      let mins = d.getMinutes();
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12;
      mins = mins < 10 ? '0' + mins : mins;
      
      clockEl.innerText = `${dayName} ${monthName} ${dateNum}   ${hrs}:${mins} ${ampm}`;
    }
  };
  updateMacClock();
  setInterval(updateMacClock, 1000);

  // --- macOS NOTIFICATION CENTER TOGGLES & SLIDERS ---
  const clockBtn = document.getElementById('mac-clock');
  const notiCenter = document.getElementById('mac-notification-center');

  // Toggle notification panel on clicking the clock/date
  clockBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playKeyboardClick(); // click sound
    notiCenter.classList.toggle('hidden-panel');
  });

  // Clicking outside notification center closes it
  document.getElementById('macos-desktop').addEventListener('click', (e) => {
    if (!notiCenter.contains(e.target) && e.target !== clockBtn && !notiCenter.classList.contains('hidden-panel')) {
      notiCenter.classList.add('hidden-panel');
    }
  });

  // Brightness slider integration (working screen dimming!)
  const brightSlider = document.getElementById('slider-brightness');
  const brightOverlay = document.getElementById('mac-brightness-overlay');
  brightSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    brightOverlay.style.backgroundColor = `rgba(0, 0, 0, ${val / 100})`;
  });

  // Volume slider integration (plays a click on change)
  const volSlider = document.getElementById('slider-volume');
  volSlider.addEventListener('change', () => {
    playKeyboardClick();
  });

  // Widget Toggles (Wi-Fi, Bluetooth, AirDrop, DND)
  const wifiCard = document.getElementById('widget-wifi');
  wifiCard.addEventListener('click', () => {
    playKeyboardClick();
    wifiCard.classList.toggle('active-widget');
    const wifiStatus = document.getElementById('wifi-status');
    wifiStatus.innerText = wifiCard.classList.contains('active-widget') ? 'Home_5G' : 'Off';
  });

  const btCard = document.getElementById('widget-bluetooth');
  btCard.addEventListener('click', () => {
    playKeyboardClick();
    btCard.classList.toggle('active-widget');
    const btStatus = document.getElementById('bt-status');
    btStatus.innerText = btCard.classList.contains('active-widget') ? 'Keychron K2' : 'Off';
  });

  const adCard = document.getElementById('widget-airdrop');
  adCard.addEventListener('click', () => {
    playKeyboardClick();
    adCard.classList.toggle('active-widget');
    const adStatus = document.getElementById('ad-status');
    adStatus.innerText = adCard.classList.contains('active-widget') ? 'Everyone' : 'Off';
  });

  const dndCard = document.getElementById('widget-dnd');
  dndCard.addEventListener('click', () => {
    playKeyboardClick();
    dndCard.classList.toggle('active-widget');
    const dndStatus = document.getElementById('dnd-status');
    dndStatus.innerText = dndCard.classList.contains('active-widget') ? 'On' : 'Off';
  });

  // Dynamic Weather widget synchronization (based on daylight toggling!)
  const syncWeatherWidget = () => {
    const isDay = !document.getElementById('day-night-toggle').classList.contains('mode-night');
    const wIcon = document.getElementById('mac-weather-icon');
    const wTemp = document.getElementById('mac-weather-temp');
    const wDesc = document.getElementById('mac-weather-desc');
    
    if (isDay) {
      if (wIcon) wIcon.innerText = '☀️';
      if (wTemp) wTemp.innerText = '22°C';
      if (wDesc) wDesc.innerText = 'Clear Skies';
      document.querySelector('.weather-widget').style.background = 'linear-gradient(135deg, rgba(255, 180, 50, 0.4) 0%, rgba(200, 100, 30, 0.5) 100%)';
    } else {
      if (wIcon) wIcon.innerText = '🌧️';
      if (wTemp) wTemp.innerText = '14°C';
      if (wDesc) wDesc.innerText = 'Rainy Storm';
      document.querySelector('.weather-widget').style.background = 'linear-gradient(135deg, rgba(30, 80, 150, 0.4) 0%, rgba(10, 30, 70, 0.6) 100%)';
    }
  };
  
  // Attach weather synchronizer to day/night toggle clicks
  document.getElementById('day-night-toggle').addEventListener('click', () => {
    setTimeout(syncWeatherWidget, 150);
  });
  
  // Initial sync
  setTimeout(syncWeatherWidget, 500);
}

/**
 * Animate camera target and position to predefined spots
 */
function triggerCameraFocus(viewName) {
  const data = focusPositions[viewName];
  if (!data) return;

  targetCamPos.set(data.pos.x, data.pos.y, data.pos.z);
  targetLookAt.set(data.lookAt.x, data.lookAt.y, data.lookAt.z);
  isAnimatingCamera = true;

  printTerminalLog(`> Re-focusing camera matrix to preset: [${viewName.toUpperCase()}]`, 'text-cyan');
}

/**
 * Execute custom retro CLI terminal command
 */
function executeTerminalCommand(cmd) {
  printTerminalLog(cmd, 'command');

  const parts = cmd.toLowerCase().split(' ');
  const baseCmd = parts[0];

  switch (baseCmd) {
    case '/help':
      printTerminalLog('Available CLI Commands:', 'text-magenta');
      printTerminalLog('  /lamp             - Toggle warm desk lamp');
      printTerminalLog('  /coffee           - Refill and spawn mug steam');
      printTerminalLog('  /day              - Transition to bright Oak daytime mode');
      printTerminalLog('  /night            - Transition to neon Cyberpunk night mode');
      printTerminalLog('  /focus [target]   - Focus camera (desk, shelf, window, overview)');
      printTerminalLog('  /pc               - Boot / shutdown the mechanical tower');
      printTerminalLog('  /clear            - Clear the terminal console logs');
      break;

    case '/lamp':
      triggerObjectAction('lamp');
      break;

    case '/coffee':
      triggerObjectAction('coffeeMug');
      break;

    case '/day':
      if (btnToggle.classList.contains('mode-night')) {
        btnToggle.click();
      } else {
        printTerminalLog('> Already in Day Mode.');
      }
      break;

    case '/night':
      if (btnToggle.classList.contains('mode-day')) {
        btnToggle.click();
      } else {
        printTerminalLog('> Already in Night Mode.');
      }
      break;

    case '/pc':
      triggerObjectAction('pc');
      break;

    case '/clear':
      termLog.innerHTML = '';
      printTerminalLog('> Terminal cleared.');
      break;

    case '/focus':
      const target = parts[1];
      if (['desk', 'shelf', 'window', 'overview'].includes(target)) {
        // Find corresponding button
        const btn = document.getElementById(`btn-view-${target}`);
        if (btn) btn.click();
      } else {
        printTerminalLog('Invalid focus target. Use: /focus [desk|shelf|window|overview]', 'error');
      }
      break;

    default:
      // Try to simulate typing it inside keyboard clicks
      playKeyboardClick();
      printTerminalLog(`bash: command not found: ${baseCmd}. Type /help for assistance.`, 'error');
  }
}

/**
 * Append message into HTML HUD console
 */
function printTerminalLog(text, className = '') {
  const line = document.createElement('div');
  line.className = `log-line ${className}`;
  line.innerText = text;
  termLog.appendChild(line);
  
  // Auto-scroll to bottom of console
  termLog.scrollTop = termLog.scrollHeight;
}

/**
 * 6. ANIMATION & RENDER LOOP
 */
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // 1. Redraw scrolling procedural canvas screen textures
  tickProceduralTextures(delta);

  // 2. Animate steam particle floating drift
  updateSteamParticles(scene, coffeeCupPos);

  // 3. Interpolate Day/Night visual transitions
  lerpTheme(lights, materialsCache, delta);

  // 4. Smooth camera focus panning
  if (isAnimatingCamera) {
    camera.position.lerp(targetCamPos, 0.08);
    controls.target.lerp(targetLookAt, 0.08);
    
    if (camera.position.distanceTo(targetCamPos) < 0.01 && controls.target.distanceTo(targetLookAt) < 0.01) {
      camera.position.copy(targetCamPos);
      controls.target.copy(targetLookAt);
      isAnimatingCamera = false;
    }
  }

  // 5. Ergonomic Chair Spinning Physics
  if (chairGroupRef && Math.abs(chairRotationSpeed) > 0.01) {
    chairGroupRef.rotation.y += chairRotationSpeed * delta;
    // Friction decay
    chairRotationSpeed *= 0.95;
  }

  // 6. Minor animated decorative details (PC fan blade spins, pulsing LEDs)
  if (isPcBooted) {
    // Pulse RGB light indices in render
    const time = Date.now() * 0.003;
    if (materialsCache.rgbLed) {
      materialsCache.rgbLed.emissive.setHSL(Math.sin(time * 0.2) * 0.5 + 0.5, 1.0, 0.5);
    }
  }

  // Update controls and render
  controls.update();
  renderer.render(scene, camera);
}

/**
 * 7. WINDOW RESIZING SUPPORT
 */
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 4.2;

  camera.left = -frustumSize * aspect;
  camera.right = frustumSize * aspect;
  camera.top = frustumSize;
  camera.bottom = -frustumSize;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Fire-up the application when window loads
window.addEventListener('DOMContentLoaded', init);
