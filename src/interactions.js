/**
 * interactions.js
 * Manages Web Audio API sound synthesis, camera focus transitions,
 * coffee steam particle systems, and Day/Night visual transitions.
 */

// Web Audio API State
let audioCtx = null;
let pcHumNode = null;
let rainNode = null;
let isRainPlaying = false;
let isPcHumPlaying = false;
let isKeyboardSoundEnabled = true;

/**
 * Initialize Audio Context on user interaction
 */
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

/**
 * Generate White Noise Buffer
 */
function createNoiseBuffer() {
  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/**
 * Synthesize Mechanical Keyboard Click
 */
export function playKeyboardClick() {
  if (!isKeyboardSoundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  // 1. Core Plastic Strike (low freq pop)
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150 + Math.random() * 100, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.015);
  
  oscGain.gain.setValueAtTime(0.3, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
  
  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);

  // 2. High-freq keycap click (spring/clack)
  const noise = audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer();
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(2000 + Math.random() * 1500, now);
  
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.12, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  
  osc.start(now);
  noise.start(now);
  
  osc.stop(now + 0.05);
  noise.stop(now + 0.05);
}

/**
 * Synthesize Desk Lamp Switch Click
 */
export function playLampClick() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  // Metal switch click
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.01);
  
  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Add high noise click
  const noise = audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(4000, now);
  
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.1, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
  
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  osc.start(now);
  noise.start(now);
  osc.stop(now + 0.03);
  noise.stop(now + 0.03);
}

/**
 * Synthesize PC Boot-up Beep
 */
export function playPcBeep() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  
  // Classic motherboard beep (short 950Hz square wave)
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(950, now);
  
  gainNode.gain.setValueAtTime(0.05, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * Toggle PC Fan Hum Noise
 */
export function togglePcHum(enable) {
  initAudio();
  if (!audioCtx) return;
  isPcHumPlaying = enable;

  if (enable) {
    if (pcHumNode) return; // Already running

    const now = audioCtx.currentTime;
    
    // PC fan is a mix of a low 60Hz hum + fan blade resonance + soft air noise
    const osc60 = audioCtx.createOscillator();
    const osc120 = audioCtx.createOscillator();
    const fanHumGain = audioCtx.createGain();
    
    osc60.type = 'sine';
    osc60.frequency.setValueAtTime(60, now);
    
    osc120.type = 'sine';
    osc120.frequency.setValueAtTime(120, now);
    
    // Air friction noise
    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer();
    noise.loop = true;
    
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(180, now);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.04, now);
    
    fanHumGain.gain.setValueAtTime(0.0, now);
    fanHumGain.gain.linearRampToValueAtTime(0.06, now + 1.0); // Smooth fade-in
    
    // Connect nodes
    osc60.connect(fanHumGain);
    osc120.connect(fanHumGain);
    noise.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(fanHumGain);
    
    fanHumGain.connect(audioCtx.destination);
    
    osc60.start(now);
    osc120.start(now);
    noise.start(now);
    
    pcHumNode = {
      osc60,
      osc120,
      noise,
      fanHumGain
    };
  } else {
    if (!pcHumNode) return;
    
    const now = audioCtx.currentTime;
    pcHumNode.fanHumGain.gain.setValueAtTime(pcHumNode.fanHumGain.gain.value, now);
    pcHumNode.fanHumGain.gain.linearRampToValueAtTime(0.0, now + 0.5); // Smooth fade-out
    
    const tempNode = pcHumNode;
    pcHumNode = null;
    
    setTimeout(() => {
      tempNode.osc60.stop();
      tempNode.osc120.stop();
      tempNode.noise.stop();
    }, 600);
  }
}

/**
 * Toggle Cozy Ambient Rain Sound
 */
export function toggleRain(enable) {
  initAudio();
  if (!audioCtx) return;
  isRainPlaying = enable;

  if (enable) {
    if (rainNode) return;

    const now = audioCtx.currentTime;
    
    // Cozy rain is high-pass/bandpass noise with a smooth gain
    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer();
    noise.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(1.0, now);
    
    // Random low-frequency rumbling for storm elements (20-40Hz)
    const rumbleOsc = audioCtx.createOscillator();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.setValueAtTime(30, now);
    
    const rumbleGain = audioCtx.createGain();
    rumbleGain.gain.setValueAtTime(0.01, now);
    
    const rainGain = audioCtx.createGain();
    rainGain.gain.setValueAtTime(0.0, now);
    rainGain.gain.linearRampToValueAtTime(0.07, now + 2.0); // Smooth fade-in
    
    noise.connect(filter);
    filter.connect(rainGain);
    
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(rainGain);
    
    rainGain.connect(audioCtx.destination);
    
    noise.start(now);
    rumbleOsc.start(now);
    
    rainNode = {
      noise,
      rumbleOsc,
      rainGain
    };

    // Trigger random thunder rumbles!
    triggerRandomThunder();
  } else {
    if (!rainNode) return;
    
    const now = audioCtx.currentTime;
    rainNode.rainGain.gain.setValueAtTime(rainNode.rainGain.gain.value, now);
    rainNode.rainGain.gain.linearRampToValueAtTime(0.0, now + 1.0); // Smooth fade-out
    
    const tempNode = rainNode;
    rainNode = null;
    
    setTimeout(() => {
      tempNode.noise.stop();
      tempNode.rumbleOsc.stop();
    }, 1200);
  }
}

/**
 * Occasional distant thunder rumbles
 */
function triggerRandomThunder() {
  if (!isRainPlaying || !rainNode || !audioCtx) return;

  const now = audioCtx.currentTime;
  
  // Distant low hum explosion
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(25 + Math.random() * 15, now);
  osc.frequency.linearRampToValueAtTime(15, now + 3.0);
  
  gainNode.gain.setValueAtTime(0.0, now);
  gainNode.gain.linearRampToValueAtTime(0.03, now + 0.5); // Slow rumble build
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start(now);
  osc.stop(now + 4.0);

  // Schedule next thunder in 15-30 seconds
  setTimeout(triggerRandomThunder, (15 + Math.random() * 15) * 1000);
}

export function setKeyboardSound(enabled) {
  isKeyboardSoundEnabled = enabled;
}

/**
 * -------------------------------------------------------------
 * STEAM PARTICLE SYSTEM
 * -------------------------------------------------------------
 */
const particles = [];
let maxSteamParticles = 25;
let isSteamActive = true;

export function toggleSteam(enable) {
  isSteamActive = enable;
}

export function updateSteamParticles(scene, coffeeMugPosition) {
  if (!coffeeMugPosition) return;

  // 1. Spawn a new particle
  if (isSteamActive && particles.length < maxSteamParticles && Math.random() < 0.15) {
    const geometry = new THREE.SphereGeometry(0.02, 4, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.15 + Math.random() * 0.15,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Spread position slightly
    mesh.position.copy(coffeeMugPosition);
    mesh.position.y += 0.05; // start just above the cup
    mesh.position.x += (Math.random() - 0.5) * 0.02;
    mesh.position.z += (Math.random() - 0.5) * 0.02;
    
    scene.add(mesh);
    
    particles.push({
      mesh,
      velocity: {
        x: (Math.random() - 0.5) * 0.003,
        y: 0.003 + Math.random() * 0.004,
        z: (Math.random() - 0.5) * 0.003
      },
      life: 1.0, // scale down life
      decay: 0.01 + Math.random() * 0.01
    });
  }

  // 2. Update existing particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.mesh.position.x += p.velocity.x;
    p.mesh.position.y += p.velocity.y;
    p.mesh.position.z += p.velocity.z;
    
    // Drift slightly sideways simulating air drafts
    p.velocity.x += (Math.random() - 0.5) * 0.0003;
    
    // Decay life
    p.life -= p.decay;
    
    // Fade out and scale up slightly (expanding steam)
    p.mesh.material.opacity = p.life * 0.25;
    const scale = 1.0 + (1.0 - p.life) * 4.0;
    p.mesh.scale.set(scale, scale, scale);
    
    if (p.life <= 0) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      particles.splice(i, 1);
    }
  }
}

// Keep a local reference to THREE (loaded dynamically in main.js)
let THREE = null;
export function setThreeRef(threeInstance) {
  THREE = threeInstance;
}

/**
 * -------------------------------------------------------------
 * DAY / NIGHT THEME TRANSITIONS
 * -------------------------------------------------------------
 */

// Target interpolation values for Day and Night states
export const ThemeConfig = {
  // Deep space ambient colors
  spaceBg: {
    night: 0x070913,
    day: 0xe0e7ff
  },
  // Room basic ambient light
  ambientLight: {
    color: { night: 0x221a44, day: 0xffffff },
    intensity: { night: 0.8, day: 1.2 }
  },
  // Directional sun/moon light
  dirLight: {
    color: { night: 0x3b82f6, day: 0xfff9e6 },
    intensity: { night: 0.5, day: 3.5 },
    pos: {
      night: { x: -8, y: 10, z: -5 },
      day: { x: -10, y: 12, z: -4 }
    }
  },
  // Desk Lamp
  lampLight: {
    color: 0xffd27f,
    intensityOn: { night: 5.0, day: 2.0 }
  },
  // Emissives (Screens, keyboard, glowing LEDs)
  screenEmissive: {
    intensity: { night: 1.5, day: 0.2 }
  },
  // Room Walls
  wallColor: {
    left: { night: 0x1a2138, day: 0xe0e7ff },
    right: { night: 0x13182b, day: 0xd4dbf5 }
  },
  // Floating Bracket Neon Sign
  neonSign: {
    intensity: { night: 6.0, day: 0.0 }
  }
};

let currentThemeFactor = 0; // 0 = Night, 1 = Day
let targetThemeFactor = 0;   // 0 = Night, 1 = Day

export function setThemeMode(mode) {
  targetThemeFactor = mode === 'day' ? 1.0 : 0.0;
}

/**
 * Smoothly transition light levels and colors in render loop
 */
export function lerpTheme(lights, materials, delta) {
  if (currentThemeFactor === targetThemeFactor) {
    return;
  }

  if (Math.abs(currentThemeFactor - targetThemeFactor) < 0.001) {
    currentThemeFactor = targetThemeFactor;
  } else {
    // Smooth ease transition factor
    currentThemeFactor += (targetThemeFactor - currentThemeFactor) * 4.0 * delta;
  }
  
  const f = currentThemeFactor;

  // 1. Ambient Light
  if (lights.ambient) {
    lights.ambient.color.lerpColors(
      new THREE.Color(ThemeConfig.ambientLight.color.night),
      new THREE.Color(ThemeConfig.ambientLight.color.day),
      f
    );
    lights.ambient.intensity = THREE.MathUtils.lerp(
      ThemeConfig.ambientLight.intensity.night,
      ThemeConfig.ambientLight.intensity.day,
      f
    );
  }

  // 2. Directional Sun/Moon Light
  if (lights.directional) {
    lights.directional.color.lerpColors(
      new THREE.Color(ThemeConfig.dirLight.color.night),
      new THREE.Color(ThemeConfig.dirLight.color.day),
      f
    );
    lights.directional.intensity = THREE.MathUtils.lerp(
      ThemeConfig.dirLight.intensity.night,
      ThemeConfig.dirLight.intensity.day,
      f
    );
    lights.directional.position.x = THREE.MathUtils.lerp(ThemeConfig.dirLight.pos.night.x, ThemeConfig.dirLight.pos.day.x, f);
    lights.directional.position.y = THREE.MathUtils.lerp(ThemeConfig.dirLight.pos.night.y, ThemeConfig.dirLight.pos.day.y, f);
    lights.directional.position.z = THREE.MathUtils.lerp(ThemeConfig.dirLight.pos.night.z, ThemeConfig.dirLight.pos.day.z, f);
  }

  // 3. Desk Lamp intensity (only if turned ON)
  if (lights.deskLamp && lights.deskLamp.userData.isOn) {
    lights.deskLamp.intensity = THREE.MathUtils.lerp(
      ThemeConfig.lampLight.intensityOn.night,
      ThemeConfig.lampLight.intensityOn.day,
      f
    );
  }

  // 4. Background Clear Color (Fog / Renderer background)
  if (lights.scene) {
    lights.scene.background.lerpColors(
      new THREE.Color(ThemeConfig.spaceBg.night),
      new THREE.Color(ThemeConfig.spaceBg.day),
      f
    );
    if (lights.scene.fog) {
      lights.scene.fog.color.lerpColors(
        new THREE.Color(ThemeConfig.spaceBg.night),
        new THREE.Color(ThemeConfig.spaceBg.day),
        f
      );
    }
  }

  // 5. Wall Materials Colors
  if (materials.leftWall && materials.rightWall) {
    materials.leftWall.color.lerpColors(
      new THREE.Color(ThemeConfig.wallColor.left.night),
      new THREE.Color(ThemeConfig.wallColor.left.day),
      f
    );
    materials.rightWall.color.lerpColors(
      new THREE.Color(ThemeConfig.wallColor.right.night),
      new THREE.Color(ThemeConfig.wallColor.right.day),
      f
    );
  }

  // 5b. Floor Wood planks color transition (Walnut to Scandinavian Oak)
  if (materials.floor) {
    materials.floor.color.lerpColors(
      new THREE.Color(0x251c16), // Dark walnut in Night mode
      new THREE.Color(0xdfd3be), // Light oak in Day mode
      f
    );
  }

  // 6. Monitor Screen Emissives
  if (materials.screens && materials.screens.length > 0) {
    const scrIntensity = THREE.MathUtils.lerp(
      ThemeConfig.screenEmissive.intensity.night,
      ThemeConfig.screenEmissive.intensity.day,
      f
    );
    materials.screens.forEach(mat => {
      mat.emissiveIntensity = scrIntensity;
    });
  }

  // 7. Led strip / Keyboard keycap glows
  if (materials.rgbLed) {
    materials.rgbLed.emissiveIntensity = THREE.MathUtils.lerp(1.8, 0.2, f);
  }
  if (materials.neonSign) {
    materials.neonSign.emissiveIntensity = THREE.MathUtils.lerp(
      ThemeConfig.neonSign.intensity.night,
      ThemeConfig.neonSign.intensity.day,
      f
    );
  }
  if (materials.neonCode) {
    materials.neonCode.emissiveIntensity = THREE.MathUtils.lerp(3.5, 0.0, f);
  }

  // 8. Custom Cursive Italic Neon Text (fades out completely in Day Mode)
  if (materials.kiddoNeon) {
    materials.kiddoNeon.opacity = THREE.MathUtils.lerp(1.0, 0.0, f);
    materials.kiddoNeon.visible = f < 0.99; // Set visible to false when it's fully off in day mode to prevent any residue glow/blending
  }

  // 9. Window Backdrop Sky and Skyline night/day colors
  if (materials.windowSky) {
    materials.windowSky.color.lerpColors(
      new THREE.Color(0x05081c), // Night deep blue
      new THREE.Color(0xbae6fd), // Day sky blue
      f
    );
  }
  if (materials.skylineLights) {
    materials.skylineLights.opacity = THREE.MathUtils.lerp(1.0, 0.0, f);
    materials.skylineLights.visible = f < 0.99;
  }
  if (materials.moon) {
    materials.moon.opacity = THREE.MathUtils.lerp(1.0, 0.0, f);
    materials.moon.visible = f < 0.99;
  }
}

/**
 * Synthesize Classic Retro Mac Startup Chime
 * Composes a rich multi-oscillator chord: F#3, F#4, A#4, C#5, F#5
 */
export function playMacChime() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  // Master Gain for smooth decay
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.0, now);
  masterGain.gain.linearRampToValueAtTime(0.35, now + 0.1); // fast fade-in
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8); // slow decay
  masterGain.connect(audioCtx.destination);

  // F# major chord frequencies
  const freqs = [185.00, 369.99, 466.16, 554.37, 739.99];

  freqs.forEach((f, idx) => {
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    
    // Mix triangle (rich warmth) and sine (purity) waves
    osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(f, now);
    
    // Add tiny detune for vintage chorus depth
    osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);
    
    // Distribute balance
    oscGain.gain.setValueAtTime(0.12, now);
    
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 3.0);
  });
}
