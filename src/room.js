/**
 * room.js
 * Builds all 3D assets, furniture, models, and materials
 * for the Isometric Developer Room.
 */

// Procedural texture cache references
export let codeTexture = null;
export let statsTexture = null;
export let pythonTexture = null;
export let jsTexture = null;
export let reactTexture = null;
export let htmlTexture = null;
export let woodFloorTexture = null;

let codeCanvas = null;
let statsCanvas = null;

// Materials Cache for Day/Night updates
export const materialsCache = {
  leftWall: null,
  rightWall: null,
  screens: [], // standard screens
  rgbLed: null,
  neonSign: null,
  floor: null, // cached floor material for light modulation
  kiddoNeon: null, // cached custom cursive neon text material
  neonCode: null, // cached pink "code" word neon material
  windowSky: null, // cached window sky backdrop material
  skylineLights: null, // cached skyline building yellow lights material
  moon: null // cached glowing moon material
};

// Interactive meshes references
export let interactiveMeshes = {
  lamp: null,
  pc: null,
  keyboard: null,
  coffeeMug: null,
  chair: null,
  mainScreen: null // added center screen reference for macOS modal trigger
};

// Object positions cache for camera focus targets
export const focusPositions = {
  overview: {
    pos: { x: 9, y: 9, z: 9 },
    lookAt: { x: 0, y: 0.5, z: 0 }
  },
  desk: {
    pos: { x: 1.8, y: 2.5, z: 1.8 },
    lookAt: { x: -1.2, y: 0.88, z: -1.35 }
  },
  shelf: {
    pos: { x: 3.5, y: 3.8, z: 0.8 },
    lookAt: { x: -1.2, y: 1.8, z: -1.5 }
  },
  window: {
    pos: { x: -0.5, y: 3.0, z: 3.5 },
    lookAt: { x: -2.5, y: 1.6, z: 0.5 }
  },
  screenFocus: { // Focus camera preset for zoom-in to main curved monitor
    pos: { x: -1.2, y: 1.24, z: -0.9 },
    lookAt: { x: -1.2, y: 1.24, z: -1.8 }
  }
};

/**
 * 1. Procedural Texture Generators
 */
function createProceduralTextures(THREE) {
  // A. Vertical Code Screen Texture (scrolling hacker green/cyan)
  codeCanvas = document.createElement('canvas');
  codeCanvas.width = 256;
  codeCanvas.height = 512;
  const ctx = codeCanvas.getContext('2d');
  
  // Initial draw
  drawCodeCanvas(ctx);
  
  codeTexture = new THREE.CanvasTexture(codeCanvas);
  codeTexture.wrapS = THREE.RepeatWrapping;
  codeTexture.wrapT = THREE.RepeatWrapping;

  // B. Server Stats Dashboard Texture (retro grids, wave graphs)
  statsCanvas = document.createElement('canvas');
  statsCanvas.width = 512;
  statsCanvas.height = 256;
  const ctx2 = statsCanvas.getContext('2d');
  
  drawStatsCanvas(ctx2, 0);
  statsTexture = new THREE.CanvasTexture(statsCanvas);

  // Generate logos
  createTechLogos(THREE);

  // Generate wood floor texture
  createWoodFloorTexture(THREE);
}

function createWoodFloorTexture(THREE) {
  const cvWood = document.createElement('canvas');
  cvWood.width = 512;
  cvWood.height = 512;
  const ctx = cvWood.getContext('2d');

  // Base canvas fill
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 12;
  const rowH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    
    // Draw wood planks with fine lighting/shading
    const shade = 220 + Math.random() * 35; // greyscale shading map
    ctx.fillStyle = `rgb(${shade}, ${shade * 0.96}, ${shade * 0.9})`;
    ctx.fillRect(0, y, 512, rowH);

    // Draw horizontal plank seams
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    // Draw vertical plank butt joints
    ctx.beginPath();
    const joints = 3;
    const offset = (r * 157) % 512;
    for (let j = 0; j < joints; j++) {
      const x = (offset + j * (512 / joints)) % 512;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowH);
    }
    ctx.stroke();

    // Draw subtle natural wood grains
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const grainCount = 3;
    for (let g = 0; g < grainCount; g++) {
      const gy = y + (g + 0.5) * (rowH / grainCount);
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(
        128, gy + (Math.random() - 0.5) * 6,
        384, gy + (Math.random() - 0.5) * 6,
        512, gy
      );
    }
    ctx.stroke();
  }

  woodFloorTexture = new THREE.CanvasTexture(cvWood);
  woodFloorTexture.wrapS = THREE.RepeatWrapping;
  woodFloorTexture.wrapT = THREE.RepeatWrapping;
  woodFloorTexture.repeat.set(2, 2);
}

function createTechLogos(THREE) {
  // A. Python Logo
  const cvPython = document.createElement('canvas');
  cvPython.width = 128;
  cvPython.height = 128;
  const ctxPy = cvPython.getContext('2d');
  ctxPy.fillStyle = '#1e2230';
  ctxPy.fillRect(0, 0, 128, 128);
  
  // Draw simplified interlocking snakes
  ctxPy.fillStyle = '#306998'; // Blue snake
  ctxPy.beginPath();
  ctxPy.arc(64, 48, 20, Math.PI, 0, false);
  ctxPy.lineTo(84, 64);
  ctxPy.arc(74, 64, 10, 0, Math.PI/2, false);
  ctxPy.lineTo(48, 74);
  ctxPy.arc(48, 64, 10, Math.PI/2, Math.PI, false);
  ctxPy.closePath();
  ctxPy.fill();

  ctxPy.fillStyle = '#ffd43b'; // Yellow snake
  ctxPy.beginPath();
  ctxPy.arc(64, 80, 20, 0, Math.PI, false);
  ctxPy.lineTo(44, 64);
  ctxPy.arc(54, 64, 10, Math.PI, -Math.PI/2, false);
  ctxPy.lineTo(80, 54);
  ctxPy.arc(80, 64, 10, -Math.PI/2, 0, false);
  ctxPy.closePath();
  ctxPy.fill();

  // Eyes
  ctxPy.fillStyle = '#1e2230';
  ctxPy.beginPath(); ctxPy.arc(54, 42, 3, 0, Math.PI*2); ctxPy.fill();
  ctxPy.beginPath(); ctxPy.arc(74, 86, 3, 0, Math.PI*2); ctxPy.fill();

  pythonTexture = new THREE.CanvasTexture(cvPython);

  // B. JS Logo
  const cvJs = document.createElement('canvas');
  cvJs.width = 128;
  cvJs.height = 128;
  const ctxJs = cvJs.getContext('2d');
  ctxJs.fillStyle = '#f7df1e'; // Yellow
  ctxJs.fillRect(0, 0, 128, 128);
  ctxJs.font = 'bold 38px "JetBrains Mono", monospace';
  ctxJs.fillStyle = '#000000';
  ctxJs.textAlign = 'right';
  ctxJs.fillText('JS', 118, 116);

  jsTexture = new THREE.CanvasTexture(cvJs);

  // C. React Logo
  const cvReact = document.createElement('canvas');
  cvReact.width = 128;
  cvReact.height = 128;
  const ctxRe = cvReact.getContext('2d');
  ctxRe.fillStyle = '#20232a'; // Dark slate
  ctxRe.fillRect(0, 0, 128, 128);
  ctxRe.strokeStyle = '#61dafb'; // React blue
  ctxRe.lineWidth = 4;
  
  // Center orbital dot
  ctxRe.fillStyle = '#61dafb';
  ctxRe.beginPath(); ctxRe.arc(64, 64, 6, 0, Math.PI*2); ctxRe.fill();
  
  // Three orbits
  for (let i = 0; i < 3; i++) {
    ctxRe.save();
    ctxRe.translate(64, 64);
    ctxRe.rotate((i * Math.PI) / 3);
    ctxRe.beginPath();
    ctxRe.scale(2.2, 0.7);
    ctxRe.arc(0, 0, 16, 0, Math.PI*2);
    ctxRe.restore();
    ctxRe.stroke();
  }

  reactTexture = new THREE.CanvasTexture(cvReact);

  // D. HTML/CSS Logo (Shield with text)
  const cvHtml = document.createElement('canvas');
  cvHtml.width = 128;
  cvHtml.height = 128;
  const ctxHt = cvHtml.getContext('2d');
  ctxHt.fillStyle = '#e44d26'; // HTML orange
  ctxHt.fillRect(0, 0, 128, 128);
  ctxHt.font = 'bold 44px "Outfit", sans-serif';
  ctxHt.fillStyle = '#ffffff';
  ctxHt.textAlign = 'center';
  ctxHt.textBaseline = 'middle';
  ctxHt.fillText('HTML', 64, 64);

  htmlTexture = new THREE.CanvasTexture(cvHtml);
}

function drawCodeCanvas(ctx) {
  const w = codeCanvas.width;
  const h = codeCanvas.height;
  
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, w, h);
  
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  const linesCount = 40;
  const indentSizes = [0, 0, 15, 15, 30, 30, 45, 30, 15, 0];
  
  for (let i = 0; i < linesCount; i++) {
    const y = i * 16 + 20;
    const indent = indentSizes[i % indentSizes.length];
    
    // Choose syntax coloring
    const r = Math.random();
    if (r < 0.25) {
      ctx.fillStyle = '#00f2fe'; // Keyword (Cyan)
      ctx.fillRect(10 + indent, y - 8, 40 + Math.random() * 20, 8);
    } else if (r < 0.55) {
      ctx.fillStyle = '#ff007f'; // Variable/Function (Magenta)
      ctx.fillRect(10 + indent, y - 8, 60 + Math.random() * 40, 8);
    } else if (r < 0.85) {
      ctx.fillStyle = '#9b51e0'; // Operator/Call (Purple)
      ctx.fillRect(10 + indent, y - 8, 30 + Math.random() * 30, 8);
    } else {
      ctx.fillStyle = '#27c93f'; // String/Comment (Green)
      ctx.fillRect(10 + indent, y - 8, 70 + Math.random() * 60, 8);
    }
  }
}

function drawStatsCanvas(ctx, timeOffset) {
  const w = statsCanvas.width;
  const h = statsCanvas.height;
  
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, w, h);
  
  // Draw grid
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
  ctx.lineWidth = 1;
  const gridSize = 16;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Draw simulated dashboard metrics
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00f2fe';
  ctx.fillText('OS_STATUS: ACTIVE', 20, 30);
  ctx.fillStyle = '#ffd700';
  ctx.fillText('COFFEE_LEVEL: 14%', 20, 50);
  ctx.fillStyle = '#ff007f';
  ctx.fillText('THREADS: 4096/STABLE', 20, 70);

  // Draw sine wave charts
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00f2fe';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  for (let x = 200; x < w - 20; x++) {
    const y = 80 + Math.sin((x + timeOffset) * 0.05) * 25 + Math.cos((x - timeOffset) * 0.02) * 10;
    if (x === 200) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow

  // Secondary bar graph
  ctx.fillStyle = '#ff007f';
  for (let i = 0; i < 8; i++) {
    const barHeight = 40 + Math.sin(timeOffset * 0.1 + i) * 20;
    ctx.fillRect(20 + i * 20, 150, 12, barHeight);
  }
  ctx.fillStyle = '#8c9ba5';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText('SYS LOAD GRAPH', 20, 230);
}

/**
 * Procedural texture tick updating
 */
export function tickProceduralTextures(delta) {
  if (codeTexture) {
    // Scroll the code lines vertically
    codeTexture.offset.y -= 0.08 * delta;
  }
  
  if (statsTexture && statsCanvas) {
    const ctx = statsCanvas.getContext('2d');
    const timeOffset = Date.now() * 0.05;
    drawStatsCanvas(ctx, timeOffset);
    statsTexture.needsUpdate = true;
  }
}

/**
 * 2. MAIN ROOM CONSTRUCTOR
 */
export function buildRoom(THREE, scene) {
  setThreeRef(THREE);
  createProceduralTextures(THREE);

  const roomGroup = new THREE.Group();

  // Color Palette Definitions
  const wallNightColor = 0x1a2138;
  const floorWoodColor = 0x1f1915; // Cozy dark floor
  const metalColor = 0x111111;
  const shelfColor = 0x2e1a0b; // Dark oak shelf
  const plantPotColor = 0xe0e0e0;
  const monsteraLeafColor = 0x2d5a27;

  // Emissive RGB Color
  const rgbNeonColor = 0xff00aa;

  // Dynamic shared materials
  const matLeftWall = new THREE.MeshStandardMaterial({
    color: wallNightColor,
    roughness: 0.9,
    metalness: 0.1
  });
  materialsCache.leftWall = matLeftWall;

  const matRightWall = new THREE.MeshStandardMaterial({
    color: 0x13182b,
    roughness: 0.9,
    metalness: 0.1
  });
  materialsCache.rightWall = matRightWall;

  const matRgbLed = new THREE.MeshStandardMaterial({
    color: rgbNeonColor,
    emissive: rgbNeonColor,
    emissiveIntensity: 1.8,
    roughness: 0.3
  });
  materialsCache.rgbLed = matRgbLed;

  const matNeonSign = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00f2fe,
    emissiveIntensity: 5.0,
    roughness: 0.1
  });
  materialsCache.neonSign = matNeonSign;

  // Define screen standard physical materials
  const matCodeScreen = new THREE.MeshPhysicalMaterial({
    map: codeTexture,
    emissiveMap: codeTexture,
    emissive: 0x00f2fe,
    emissiveIntensity: 1.5,
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1.0
  });
  materialsCache.screens.push(matCodeScreen);

  const matStatsScreen = new THREE.MeshPhysicalMaterial({
    map: statsTexture,
    emissiveMap: statsTexture,
    emissive: 0xff00aa,
    emissiveIntensity: 1.2,
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1.0
  });
  materialsCache.screens.push(matStatsScreen);

  const matMainIdeScreen = new THREE.MeshPhysicalMaterial({
    color: 0x080f1e,
    emissive: 0x00a8ff,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.8,
    clearcoat: 0.8
  });
  materialsCache.screens.push(matMainIdeScreen);

  /**
   * A. FLOOR & WALLS
   */
  // Floor Base (Procedural wood flooring planks map!)
  const floorWoodColorDark = 0x251c16; // Elegant dark cherry-walnut wood floor baseline for Night mode
  const floorGeo = new THREE.BoxGeometry(7, 0.3, 7);
  const floorMat = new THREE.MeshStandardMaterial({
    map: woodFloorTexture,
    color: floorWoodColorDark,
    roughness: 0.45,
    metalness: 0.1
  });
  materialsCache.floor = floorMat;
  
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = -0.15;
  floorMesh.receiveShadow = true;
  roomGroup.add(floorMesh);

  // Decorative border trim
  const floorBaseTrimGeo = new THREE.BoxGeometry(7.2, 0.05, 7.2);
  const floorBaseTrimMat = new THREE.MeshStandardMaterial({ color: 0x0a0c16, roughness: 0.9 });
  const floorBaseTrim = new THREE.Mesh(floorBaseTrimGeo, floorBaseTrimMat);
  floorBaseTrim.position.y = -0.3;
  roomGroup.add(floorBaseTrim);

  // Left Wall segments (Z-axis wall, has window cutout at Y=1.1-2.9, Z=-0.2 to 2.2)
  const leftWallGroup = new THREE.Group();

  // Segment A: Left side (towards Z = -3.5)
  const segA = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 3.3), matLeftWall);
  segA.position.set(-3.5, 2.0, -1.85);
  segA.receiveShadow = true;
  segA.castShadow = true;
  leftWallGroup.add(segA);

  // Segment B: Right side (towards Z = 3.5)
  const segB = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 1.3), matLeftWall);
  segB.position.set(-3.5, 2.0, 2.85);
  segB.receiveShadow = true;
  segB.castShadow = true;
  leftWallGroup.add(segB);

  // Segment C: Bottom side (under the window)
  const segC = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 2.4), matLeftWall);
  segC.position.set(-3.5, 0.55, 1.0);
  segC.receiveShadow = true;
  segC.castShadow = true;
  leftWallGroup.add(segC);

  // Segment D: Top side (above the window)
  const segD = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 2.4), matLeftWall);
  segD.position.set(-3.5, 3.45, 1.0);
  segD.receiveShadow = true;
  segD.castShadow = true;
  leftWallGroup.add(segD);

  roomGroup.add(leftWallGroup);

  // Right Wall (X-axis wall)
  const rightWallGeo = new THREE.BoxGeometry(7.0, 4.0, 0.3);
  const rightWall = new THREE.Mesh(rightWallGeo, matRightWall);
  rightWall.position.set(0, 2.0, -3.5);
  rightWall.receiveShadow = true;
  rightWall.castShadow = true;
  roomGroup.add(rightWall);

  // Window frame on Left Wall (constructed by building frame parts to avoid CSG complex code)
  const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x0e1220, roughness: 0.7 });
  const windowGroup = new THREE.Group();
  windowGroup.position.set(-3.35, 2.0, 1.0); // Shifted in Z, slightly out of wall X

  // Window outer box borders
  const borderHeight = 1.8;
  const borderWidth = 2.4;
  const borderDepth = 0.08;
  const frameThickness = 0.12;

  // Frame meshes
  const winTop = new THREE.Mesh(new THREE.BoxGeometry(borderDepth, frameThickness, borderWidth), winFrameMat);
  winTop.position.set(0, borderHeight / 2, 0);
  winTop.castShadow = true;
  windowGroup.add(winTop);

  const winBottom = new THREE.Mesh(new THREE.BoxGeometry(borderDepth, frameThickness, borderWidth), winFrameMat);
  winBottom.position.set(0, -borderHeight / 2, 0);
  winBottom.castShadow = true;
  windowGroup.add(winBottom);

  const winLeft = new THREE.Mesh(new THREE.BoxGeometry(borderDepth, borderHeight, frameThickness), winFrameMat);
  winLeft.position.set(0, 0, -borderWidth / 2);
  winLeft.castShadow = true;
  windowGroup.add(winLeft);

  const winRight = new THREE.Mesh(new THREE.BoxGeometry(borderDepth, borderHeight, frameThickness), winFrameMat);
  winRight.position.set(0, 0, borderWidth / 2);
  winRight.castShadow = true;
  windowGroup.add(winRight);

  // Inner cross frames
  const winMiddleH = new THREE.Mesh(new THREE.BoxGeometry(borderDepth, 0.06, borderWidth), winFrameMat);
  winMiddleH.position.set(0, 0, 0);
  windowGroup.add(winMiddleH);

  const winMiddleV = new THREE.Mesh(new THREE.BoxGeometry(borderDepth, borderHeight, 0.06), winFrameMat);
  winMiddleV.position.set(0, 0, 0);
  windowGroup.add(winMiddleV);

  // Premium window glass reflections material
  const winGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.12,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.8,
    ior: 1.5,
    thickness: 0.05,
    depthWrite: false
  });
  const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.01, borderHeight - 0.05, borderWidth - 0.05), winGlassMat);
  winGlass.position.set(0, 0, 0);
  windowGroup.add(winGlass);

  // Glowing city skyline backdrop behind the window
  const cityBackdropGeo = new THREE.PlaneGeometry(3.5, 2.5);
  const cityBackdropMat = new THREE.MeshBasicMaterial({
    color: 0x05081c,
    side: THREE.DoubleSide
  });
  const cityBackdrop = new THREE.Mesh(cityBackdropGeo, cityBackdropMat);
  cityBackdrop.position.set(-3.7, 2.0, 1.0);
  cityBackdrop.rotation.y = Math.PI / 2;
  roomGroup.add(cityBackdrop);
  materialsCache.windowSky = cityBackdropMat;

  // Add a beautiful glowing moon in the sky
  const moonMat = new THREE.MeshBasicMaterial({
    color: 0xfffcd3,
    transparent: true,
    opacity: 1.0
  });
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), moonMat);
  moon.position.set(-3.69, 2.65, 0.2); // Upper left quadrant of the window view
  moon.rotation.y = Math.PI / 2;
  roomGroup.add(moon);
  materialsCache.moon = moonMat;

  // Add small glowing box skyscrapers on the city backdrop
  const skylineGroup = new THREE.Group();
  skylineGroup.position.set(-3.68, 1.2, 1.0);
  skylineGroup.rotation.y = Math.PI / 2;

  const buildingColors = [0x0d152d, 0x152244, 0x1d2e5a];
  const windowGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffdb6b,
    transparent: true,
    opacity: 1.0
  });
  materialsCache.skylineLights = windowGlowMat;

  for (let i = 0; i < 15; i++) {
    const bh = 0.5 + Math.random() * 1.5;
    const bw = 0.2 + Math.random() * 0.3;
    const bd = 0.1;
    const bColor = buildingColors[i % buildingColors.length];
    
    const bMat = new THREE.MeshBasicMaterial({ color: bColor });
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bMat);
    bMesh.position.set(-1.2 + i * 0.22, bh / 2, -0.05);
    skylineGroup.add(bMesh);

    // Tiny dots representing windows
    if (Math.random() > 0.3) {
      const dotCount = Math.floor(bh * 4);
      for (let j = 0; j < dotCount; j++) {
        const dot = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.02), windowGlowMat);
        dot.position.set(
          bMesh.position.x + (Math.random() - 0.5) * bw * 0.6,
          0.1 + j * 0.25 + Math.random() * 0.05,
          0.001
        );
        skylineGroup.add(dot);
      }
    }
  }
  roomGroup.add(skylineGroup);
  roomGroup.add(windowGroup);

  /**
   * B. SLEEK L-SHAPED CORNER DESK
   */
  const deskGroup = new THREE.Group();
  deskGroup.position.set(-1.2, 0, -1.2); // positioned in the corner

  const deskWoodMat = new THREE.MeshStandardMaterial({
    color: 0x3d2314, // Rich mahogany
    roughness: 0.3,
    metalness: 0.1
  });
  
  // Main Desk segment (aligned along the right wall Z axis)
  const deskMainGeo = new THREE.BoxGeometry(3.5, 0.12, 1.4);
  const deskMain = new THREE.Mesh(deskMainGeo, deskWoodMat);
  deskMain.position.set(0, 0.8, -0.4);
  deskMain.castShadow = true;
  deskMain.receiveShadow = true;
  deskGroup.add(deskMain);

  // Side Desk segment (along the left wall X axis)
  const deskSideGeo = new THREE.BoxGeometry(1.2, 0.12, 2.0);
  const deskSide = new THREE.Mesh(deskSideGeo, deskWoodMat);
  deskSide.position.set(-1.15, 0.8, 1.3);
  deskSide.castShadow = true;
  deskSide.receiveShadow = true;
  deskGroup.add(deskSide);

  // Metal Cylindrical Legs
  const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
  const legMat = new THREE.MeshStandardMaterial({ color: metalColor, roughness: 0.4, metalness: 0.8 });
  
  const legPositions = [
    { x: 1.6, z: 0.1 },
    { x: 1.6, z: -0.9 },
    { x: -0.8, z: -0.9 },
    { x: -1.6, z: 0.4 },
    { x: -1.6, z: 2.1 },
    { x: -0.7, z: 2.1 }
  ];

  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(pos.x, 0.4, pos.z);
    leg.castShadow = true;
    deskGroup.add(leg);
  });

  // Large leather desk pad (black rectangle with fine round edges)
  const padGeo = new THREE.BoxGeometry(1.8, 0.02, 0.75);
  const padMat = new THREE.MeshStandardMaterial({ color: 0x1c1e21, roughness: 0.8, metalness: 0.05 });
  const deskPad = new THREE.Mesh(padGeo, padMat);
  deskPad.position.set(0, 0.86, -0.4);
  deskPad.receiveShadow = true;
  deskGroup.add(deskPad);

  roomGroup.add(deskGroup);

  /**
   * C. ERGONOMIC CHAIR
   */
  const chairGroup = new THREE.Group();
  chairGroup.position.set(-0.7, 0, -0.3); // In front of main desk
  chairGroup.rotation.y = Math.PI / 4;   // rotated slightly towards the L desk

  const plasticMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.3 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.1, metalness: 0.95 });
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 });

  // 1. Caster Base: 5 star legs
  const baseCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), plasticMat);
  baseCenter.position.y = 0.1;
  chairGroup.add(baseCenter);

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.06), plasticMat);
    arm.position.set(Math.cos(angle) * 0.2, 0.1, Math.sin(angle) * 0.2);
    arm.rotation.y = -angle;
    chairGroup.add(arm);

    // Tiny wheels
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), plasticMat);
    wheel.position.set(Math.cos(angle) * 0.4, 0.04, Math.sin(angle) * 0.4);
    wheel.rotation.z = Math.PI / 2;
    chairGroup.add(wheel);
  }

  // 2. Central Hydraulic Cylinder
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 10), chromeMat);
  cylinder.position.y = 0.26;
  cylinder.castShadow = true;
  chairGroup.add(cylinder);

  // 3. Seat Base & Cushion
  const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.05, 0.68), plasticMat);
  seatBase.position.y = 0.43;
  seatBase.castShadow = true;
  chairGroup.add(seatBase);

  const seatCushion = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.65), cushionMat);
  seatCushion.position.y = 0.49;
  seatCushion.castShadow = true;
  chairGroup.add(seatCushion);

  // 4. Mesh Backrest (curved profile)
  const backrestSupport = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.1), plasticMat);
  backrestSupport.position.set(0, 0.72, 0.3);
  backrestSupport.castShadow = true;
  chairGroup.add(backrestSupport);

  const backrestFrame = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.06), plasticMat);
  backrestFrame.position.set(0, 0.88, 0.3);
  backrestFrame.castShadow = true;
  chairGroup.add(backrestFrame);

  const backrestCushion = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.54, 0.04), cushionMat);
  backrestCushion.position.set(0, 0.88, 0.27);
  chairGroup.add(backrestCushion);

  // Headrest
  const headrestSupport = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), chromeMat);
  headrestSupport.position.set(0, 1.2, 0.32);
  chairGroup.add(headrestSupport);

  const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.06), cushionMat);
  headrest.position.set(0, 1.28, 0.29);
  headrest.castShadow = true;
  chairGroup.add(headrest);

  // 5. Adjusting Armrests
  const armrestLSupport = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.06), chromeMat);
  armrestLSupport.position.set(-0.35, 0.56, 0);
  chairGroup.add(armrestLSupport);

  const armrestLPad = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.26), plasticMat);
  armrestLPad.position.set(-0.35, 0.67, -0.05);
  chairGroup.add(armrestLPad);

  const armrestRSupport = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.06), chromeMat);
  armrestRSupport.position.set(0.35, 0.56, 0);
  chairGroup.add(armrestRSupport);

  const armrestRPad = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.26), plasticMat);
  armrestRPad.position.set(0.35, 0.67, -0.05);
  chairGroup.add(armrestRPad);

  // Save reference for interactive clicks
  interactiveMeshes.chair = seatCushion;

  roomGroup.add(chairGroup);

  /**
   * D. TRIPLE MONITOR RIG
   */
  const monitorsGroup = new THREE.Group();
  monitorsGroup.position.set(-1.2, 0.86, -1.8); // Placed relative to main desk height

  // Solid Desk-Mount stand base
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), legMat);
  standBase.position.set(0, 0.04, 0);
  monitorsGroup.add(standBase);

  const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 10), legMat);
  standPole.position.set(0, 0.26, 0);
  standPole.castShadow = true;
  monitorsGroup.add(standPole);

  // Articulated Monitor Arms (gas-spring joints connecting the floating side monitors)
  const armJointMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.8 });
  const armBarMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.8 });

  // 1. LEFT MONITOR ARTICULATED MOUNT
  const innerLeftArm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.035, 0.035), armBarMat);
  innerLeftArm.position.set(-0.25, 0.36, -0.08);
  innerLeftArm.rotation.y = 0.3;
  innerLeftArm.castShadow = true;
  monitorsGroup.add(innerLeftArm);

  const leftJointHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.08, 8), armJointMat);
  leftJointHinge.position.set(-0.5, 0.36, -0.16);
  leftJointHinge.castShadow = true;
  monitorsGroup.add(leftJointHinge);

  const outerLeftArm = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 0.03), armBarMat);
  outerLeftArm.position.set(-0.76, 0.36, -0.11);
  outerLeftArm.rotation.y = -0.18;
  outerLeftArm.castShadow = true;
  monitorsGroup.add(outerLeftArm);

  const leftVesaMount = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.06), armJointMat);
  leftVesaMount.position.set(-1.0, 0.36, -0.075);
  leftVesaMount.rotation.y = 0.45; // Match vertical screen rotation
  leftVesaMount.castShadow = true;
  monitorsGroup.add(leftVesaMount);

  // 2. RIGHT MONITOR ARTICULATED MOUNT
  const innerRightArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.035, 0.035), armBarMat);
  innerRightArm.position.set(0.22, 0.36, -0.08);
  innerRightArm.rotation.y = -0.3;
  innerRightArm.castShadow = true;
  monitorsGroup.add(innerRightArm);

  const rightJointHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.08, 8), armJointMat);
  rightJointHinge.position.set(0.44, 0.36, -0.15);
  rightJointHinge.castShadow = true;
  monitorsGroup.add(rightJointHinge);

  const outerRightArm = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.03), armBarMat);
  outerRightArm.position.set(0.68, 0.36, -0.1);
  outerRightArm.rotation.y = 0.16;
  outerRightArm.castShadow = true;
  monitorsGroup.add(outerRightArm);

  const rightVesaMount = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.06), armJointMat);
  rightVesaMount.position.set(0.9, 0.36, -0.075);
  rightVesaMount.rotation.y = -0.45; // Match right screen rotation
  rightVesaMount.castShadow = true;
  monitorsGroup.add(rightVesaMount);

  // 1. CENTER SCREEN: Gorgeous Ultrawide Curved Display (composed of three flat plates side by side angled)
  const centerScreenGroup = new THREE.Group();
  centerScreenGroup.position.set(0, 0.38, 0);

  const screenBezelMat = new THREE.MeshStandardMaterial({ color: 0x0c0d12, roughness: 0.8 });
  const centerW = 0.55;
  const centerY = 0.36;

  // Middle Plate
  const screenCenterMid = new THREE.Mesh(new THREE.BoxGeometry(centerW, centerY, 0.03), screenBezelMat);
  centerScreenGroup.add(screenCenterMid);

  const screenCenterMidDisp = new THREE.Mesh(new THREE.BoxGeometry(centerW - 0.03, centerY - 0.03, 0.005), matMainIdeScreen);
  screenCenterMidDisp.position.z = 0.015;
  centerScreenGroup.add(screenCenterMidDisp);

  // Set reference for macOS portfolio trigger
  interactiveMeshes.mainScreen = screenCenterMidDisp;

  // Left wing of curved display
  const wingW = 0.32;
  const wingAngle = 0.18;
  const wingGroupL = new THREE.Group();
  wingGroupL.position.set(-centerW / 2, 0, 0);
  wingGroupL.rotation.y = wingAngle;

  const screenCenterLeft = new THREE.Mesh(new THREE.BoxGeometry(wingW, centerY, 0.03), screenBezelMat);
  screenCenterLeft.position.x = -wingW / 2;
  wingGroupL.add(screenCenterLeft);

  const screenCenterLeftDisp = new THREE.Mesh(new THREE.BoxGeometry(wingW - 0.02, centerY - 0.03, 0.005), matMainIdeScreen);
  screenCenterLeftDisp.position.set(-wingW / 2, 0, 0.015);
  wingGroupL.add(screenCenterLeftDisp);
  centerScreenGroup.add(wingGroupL);

  // Right wing of curved display
  const wingGroupR = new THREE.Group();
  wingGroupR.position.set(centerW / 2, 0, 0);
  wingGroupR.rotation.y = -wingAngle;

  const screenCenterRight = new THREE.Mesh(new THREE.BoxGeometry(wingW, centerY, 0.03), screenBezelMat);
  screenCenterRight.position.x = wingW / 2;
  wingGroupR.add(screenCenterRight);

  const screenCenterRightDisp = new THREE.Mesh(new THREE.BoxGeometry(wingW - 0.02, centerY - 0.03, 0.005), matMainIdeScreen);
  screenCenterRightDisp.position.set(wingW / 2, 0, 0.015);
  wingGroupR.add(screenCenterRightDisp);
  centerScreenGroup.add(wingGroupR);

  monitorsGroup.add(centerScreenGroup);

  // 2. LEFT SCREEN: Vertical display for Scrolling Code Lines
  const leftScreenGroup = new THREE.Group();
  leftScreenGroup.position.set(-1.0, 0.36, -0.06);
  leftScreenGroup.rotation.y = 0.45; // Turn heavily inward

  const leftBezel = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.54, 0.03), screenBezelMat);
  leftScreenGroup.add(leftBezel);

  const leftDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.51, 0.005), matCodeScreen);
  leftDisplay.position.z = 0.015;
  leftScreenGroup.add(leftDisplay);
  monitorsGroup.add(leftScreenGroup);

  // 3. RIGHT SCREEN: Secondary landscape monitor for stats logs
  const rightScreenGroup = new THREE.Group();
  rightScreenGroup.position.set(0.9, 0.36, -0.06);
  rightScreenGroup.rotation.y = -0.45; // Turn inward

  const rightBezel = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.03), screenBezelMat);
  rightScreenGroup.add(rightBezel);

  const rightDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.29, 0.005), matStatsScreen);
  rightDisplay.position.z = 0.015;
  rightScreenGroup.add(rightDisplay);
  monitorsGroup.add(rightScreenGroup);

  roomGroup.add(monitorsGroup);

  /**
   * E. HIGH-END CUSTOM PC TOWER (THE BEAST)
   */
  const pcGroup = new THREE.Group();
  pcGroup.position.set(-2.5, 0.86, -0.85); // corner right on the desk
  pcGroup.rotation.y = Math.PI / 4;

  const pcBodyMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.4, metalness: 0.7 });
  const pcAcrylicMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.02
  });

  // PC Outer Box Structure (Solid panels)
  const pcHeight = 0.54;
  const pcWidth = 0.25;
  const pcDepth = 0.46;

  // Solid bottom & top base
  const pcBase = new THREE.Mesh(new THREE.BoxGeometry(pcWidth, 0.04, pcDepth), pcBodyMat);
  pcBase.position.y = 0.02;
  pcGroup.add(pcBase);

  const pcTop = new THREE.Mesh(new THREE.BoxGeometry(pcWidth, 0.03, pcDepth), pcBodyMat);
  pcTop.position.y = pcHeight - 0.015;
  pcGroup.add(pcTop);

  // Front bezel (matte mesh grill look)
  const pcFront = new THREE.Mesh(new THREE.BoxGeometry(pcWidth, pcHeight - 0.07, 0.02), new THREE.MeshStandardMaterial({ color: 0x141822, roughness: 0.9 }));
  pcFront.position.set(0, pcHeight / 2, pcDepth / 2 - 0.01);
  pcFront.castShadow = true;
  pcGroup.add(pcFront);

  // Back panel
  const pcBack = new THREE.Mesh(new THREE.BoxGeometry(pcWidth, pcHeight - 0.07, 0.02), pcBodyMat);
  pcBack.position.set(0, pcHeight / 2, -pcDepth / 2 + 0.01);
  pcGroup.add(pcBack);

  // Outer solid metal side panel (facing wall)
  const pcSideSolid = new THREE.Mesh(new THREE.BoxGeometry(0.02, pcHeight - 0.07, pcDepth - 0.04), pcBodyMat);
  pcSideSolid.position.set(-pcWidth / 2 + 0.01, pcHeight / 2, 0);
  pcGroup.add(pcSideSolid);

  // Tempered Glass Transparent Side Panel (facing center of the room)
  const pcGlassSide = new THREE.Mesh(new THREE.BoxGeometry(0.01, pcHeight - 0.07, pcDepth - 0.04), pcAcrylicMat);
  pcGlassSide.position.set(pcWidth / 2 - 0.005, pcHeight / 2, 0);
  pcGroup.add(pcGlassSide);

  // INNER PC COMPONENTS: Motherboard, GPU, Glowing RAM, RGB Cooler
  const innerGroup = new THREE.Group();
  innerGroup.position.set(0, 0.04, 0);

  // Motherboard board
  const mobo = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.32), new THREE.MeshStandardMaterial({ color: 0x112211, roughness: 0.9 }));
  mobo.position.set(-pcWidth / 2 + 0.04, pcHeight / 2 - 0.04, 0);
  innerGroup.add(mobo);

  // CPU AIO Liquid Cooler (Glowing circular ring)
  const aioCooler = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), matRgbLed);
  aioCooler.position.set(-pcWidth / 2 + 0.06, 0.28, 0.0);
  aioCooler.rotation.z = Math.PI / 2;
  innerGroup.add(aioCooler);

  // Glowing RAM sticks
  const ramGlow = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.08, 0.015), matRgbLed);
  ramGlow.position.set(-pcWidth / 2 + 0.05, 0.28, 0.08);
  
  for (let i = 0; i < 4; i++) {
    const ram = ramGlow.clone();
    ram.position.z += i * 0.012;
    innerGroup.add(ram);
  }

  // Graphics Card (Massive block with dual fans)
  const gpu = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.28), new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.6 }));
  gpu.position.set(-pcWidth / 2 + 0.09, 0.14, 0);
  gpu.castShadow = true;
  innerGroup.add(gpu);

  // GPU glowing side logo strip
  const gpuStrip = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, 0.18), matRgbLed);
  gpuStrip.position.set(-pcWidth / 2 + 0.132, 0.15, 0);
  innerGroup.add(gpuStrip);

  // Exhaust rear fan (glows RGB)
  const rearFan = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 10), matRgbLed);
  rearFan.position.set(-pcWidth / 2 + 0.05, 0.32, -pcDepth / 2 + 0.04);
  rearFan.rotation.y = Math.PI / 2;
  innerGroup.add(rearFan);

  pcGroup.add(innerGroup);

  // Save reference for interactive clicks
  interactiveMeshes.pc = pcGlassSide;

  roomGroup.add(pcGroup);

  /**
   * F. RGB MECHANICAL KEYBOARD & GAMING MOUSE
   */
  const keyboardGroup = new THREE.Group();
  keyboardGroup.position.set(-1.2, 0.86, -0.95); // Positioned in front of the monitors on the desk pad

  // Keyboard base frame
  const kbW = 0.58;
  const kbD = 0.20;
  const kbFrameGeo = new THREE.BoxGeometry(kbW, 0.025, kbD);
  const kbFrameMat = new THREE.MeshStandardMaterial({ color: 0x1c1c24, roughness: 0.6 });
  const kbFrame = new THREE.Mesh(kbFrameGeo, kbFrameMat);
  kbFrame.position.set(0, 0.0125, -0.38);
  kbFrame.castShadow = true;
  keyboardGroup.add(kbFrame);

  // Glowing underglow strip base
  const kbUnderglow = new THREE.Mesh(new THREE.BoxGeometry(kbW + 0.02, 0.005, kbD + 0.02), matRgbLed);
  kbUnderglow.position.set(0, 0.002, -0.38);
  keyboardGroup.add(kbUnderglow);

  // Keycap groups (individual detailed boxes for 3D wow factor!)
  const keyMatDark = new THREE.MeshStandardMaterial({ color: 0x2b2b36, roughness: 0.7 });
  const keyMatLight = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.7 });
  const keyMatAccent = new THREE.MeshStandardMaterial({ color: 0xff4f00, roughness: 0.5 }); // Hot orange Escape/Enter

  const cols = 15;
  const rows = 5;
  const keyW = (kbW - 0.04) / cols;
  const keyD = (kbD - 0.04) / rows;
  const keyH = 0.015;

  const keycapGeo = new THREE.BoxGeometry(keyW * 0.85, keyH, keyD * 0.85);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let mat = keyMatLight;
      if (r === 0 && c === 0) mat = keyMatAccent; // ESC key
      else if (r === 2 && c === 14) mat = keyMatAccent; // ENTER key
      else if (c === 0 || c === 14 || r === 4) mat = keyMatDark; // Modifiers, spacebar
      
      const key = new THREE.Mesh(keycapGeo, mat);
      
      // Adjust standard spacebar size
      if (r === 4 && c >= 4 && c <= 9) {
        if (c !== 4) continue; // skip duplicates, draw single long spacebar
        const spaceGeo = new THREE.BoxGeometry(keyW * 5.85, keyH, keyD * 0.85);
        const spacebar = new THREE.Mesh(spaceGeo, keyMatDark);
        spacebar.position.set(
          -kbW / 2 + 0.02 + (c + 2.5) * keyW,
          0.025 + keyH / 2,
          -0.38 - kbD / 2 + 0.02 + r * keyD
        );
        spacebar.castShadow = true;
        keyboardGroup.add(spacebar);
        continue;
      }
      
      key.position.set(
        -kbW / 2 + 0.02 + c * keyW + keyW / 2,
        0.025 + keyH / 2,
        -0.38 - kbD / 2 + 0.02 + r * keyD + keyD / 2
      );
      key.castShadow = true;
      keyboardGroup.add(key);
    }
  }

  // Keyboard Cable (USB-C coiled cable)
  const cableGroup = new THREE.Group();
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 });
  // Horizontal wire going to monitors
  const cableWire = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.12), cableMat);
  cableWire.position.set(0, 0.015, -0.53);
  cableGroup.add(cableWire);
  keyboardGroup.add(cableGroup);

  // Mouse
  const mouseMat = new THREE.MeshStandardMaterial({ color: 0x15161c, roughness: 0.5, metalness: 0.4 });
  const mouseGroup = new THREE.Group();
  mouseGroup.position.set(0.42, 0.0125, -0.38); // To the right of keyboard
  
  const mouseGeo = new THREE.BoxGeometry(0.08, 0.035, 0.14);
  const mouse = new THREE.Mesh(mouseGeo, mouseMat);
  mouse.castShadow = true;
  mouseGroup.add(mouse);

  // Mouse RGB glowing scroll wheel
  const wheelGlow = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.03), matRgbLed);
  wheelGlow.position.set(0, 0.018, -0.03);
  mouseGroup.add(wheelGlow);
  keyboardGroup.add(mouseGroup);

  // Sleek Stylus Pen / Wacom Digital Pen
  const penGroup = new THREE.Group();
  penGroup.position.set(0.53, 0.01, -0.35);
  penGroup.rotation.y = -0.35; // angled slightly next to mouse
  
  const penBodyGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.15, 6);
  const penBodyMat = new THREE.MeshStandardMaterial({ color: 0x18181f, roughness: 0.6 });
  const penBody = new THREE.Mesh(penBodyGeo, penBodyMat);
  penBody.rotation.x = Math.PI / 2;
  penBody.castShadow = true;
  penGroup.add(penBody);

  const penTipGeo = new THREE.ConeGeometry(0.008, 0.024, 6);
  const penTipMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.3 });
  const penTip = new THREE.Mesh(penTipGeo, penTipMat);
  penTip.position.set(0, 0, 0.087);
  penTip.rotation.x = -Math.PI / 2;
  penTip.castShadow = true;
  penGroup.add(penTip);
  keyboardGroup.add(penGroup);

  // Save reference for interactive clicks
  interactiveMeshes.keyboard = kbFrame;

  roomGroup.add(keyboardGroup);

  /**
   * G. COZY COFFEE MUG
   */
  const mugGroup = new THREE.Group();
  mugGroup.position.set(-1.65, 0.86, -1.35); // Left desk pad area, in front of screens next to keyboard

  const mugMat = new THREE.MeshStandardMaterial({ color: 0xff00aa, roughness: 0.2, metalness: 0.1 }); // Cute hot magenta mug
  
  // Outer Mug Cup
  const mugOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12), mugMat);
  mugOuter.position.y = 0.06;
  mugOuter.castShadow = true;
  mugGroup.add(mugOuter);

  // Handle
  const handleGeo = new THREE.TorusGeometry(0.035, 0.01, 8, 12);
  const handle = new THREE.Mesh(handleGeo, mugMat);
  handle.position.set(0.06, 0.06, 0);
  handle.rotation.z = Math.PI / 2;
  mugGroup.add(handle);

  // Coffee liquid level inside cup
  const coffeeLiquidMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.8 });
  const coffeeLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 10), coffeeLiquidMat);
  coffeeLiquid.position.y = 0.105;
  mugGroup.add(coffeeLiquid);

  // Save reference for interactive clicks
  interactiveMeshes.coffeeMug = mugOuter;

  roomGroup.add(mugGroup);

  /**
   * H. WINDOW ACCENTS & DESK LAMP
   */
  // High-End Classic Desk Lamp
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-2.6, 0.86, -1.8); // Left of keyboard

  const lampMat = new THREE.MeshStandardMaterial({ color: 0xe0e7ff, roughness: 0.3, metalness: 0.6 }); // White/Chrome finish
  
  // Base
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), lampMat);
  lampBase.position.y = 0.01;
  lampBase.castShadow = true;
  lampGroup.add(lampBase);

  // Double articulated neck segments
  const neckPart1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 8), lampMat);
  neckPart1.position.set(-0.04, 0.14, 0.02);
  neckPart1.rotation.z = -0.3;
  neckPart1.rotation.y = 0.2;
  neckPart1.castShadow = true;
  lampGroup.add(neckPart1);

  const neckJoint = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), lampMat);
  neckJoint.position.copy(neckPart1.position).addScaledVector(new THREE.Vector3(-0.08, 0.13, 0), 1.0);
  lampGroup.add(neckJoint);

  const neckPart2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.32, 8), lampMat);
  neckPart2.position.set(neckJoint.position.x + 0.08, neckJoint.position.y + 0.14, neckJoint.position.z + 0.02);
  neckPart2.rotation.z = 0.55;
  neckPart2.castShadow = true;
  lampGroup.add(neckPart2);

  // Lamp shade bell
  const shadeGroup = new THREE.Group();
  shadeGroup.position.set(neckPart2.position.x + 0.08, neckPart2.position.y + 0.15, neckPart2.position.z);
  shadeGroup.rotation.z = -0.55; // Angle pointing down to keyboard

  const shadeGeo = new THREE.CylinderGeometry(0.04, 0.09, 0.14, 12, 1, true); // open-ended cone
  const shade = new THREE.Mesh(shadeGeo, lampMat);
  shade.castShadow = true;
  shadeGroup.add(shade);

  // Internal glowing light bulb
  const bulbGeo = new THREE.SphereGeometry(0.035, 10, 10);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd27f });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.y = -0.03;
  shadeGroup.add(bulb);

  lampGroup.add(shadeGroup);

  // Save reference for interactive clicks
  interactiveMeshes.lamp = shade;

  roomGroup.add(lampGroup);

  /**
   * I. WALL SHELVES & ACCENTS
   */
  const shelvesGroup = new THREE.Group();
  shelvesGroup.position.set(-1.0, 2.5, -3.35); // Anchored to back right wall X

  // Floating Shelf 1 (Lower shelf)
  const shelf1Geo = new THREE.BoxGeometry(2.4, 0.08, 0.38);
  const shelfMat = new THREE.MeshStandardMaterial({ color: shelfColor, roughness: 0.5 });
  const shelf1 = new THREE.Mesh(shelf1Geo, shelfMat);
  shelf1.castShadow = true;
  shelf1.receiveShadow = true;
  shelvesGroup.add(shelf1);

  // Floating Shelf 2 (Higher shelf)
  const shelf2Geo = new THREE.BoxGeometry(1.8, 0.08, 0.38);
  const shelf2 = new THREE.Mesh(shelf2Geo, shelfMat);
  shelf2.position.set(0.3, 0.6, 0);
  shelf2.castShadow = true;
  shelf2.receiveShadow = true;
  shelvesGroup.add(shelf2);

  // BOOKS on Shelf 1 (Procedural box rows of colorful books)
  const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x6b7280];
  
  for (let i = 0; i < 8; i++) {
    const bw = 0.04 + Math.random() * 0.02;
    const bh = 0.22 + Math.random() * 0.08;
    const bd = 0.28;
    const color = bookColors[i % bookColors.length];
    
    const bookMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bookMat);
    book.position.set(-0.8 + i * 0.07, bh / 2 + 0.04, 0.02);
    book.castShadow = true;
    shelvesGroup.add(book);
  }

  // Slanted book on Shelf 1
  const slantedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
  const slantedBook = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.28), slantedMat);
  slantedBook.position.set(-0.2, 0.12, 0.02);
  slantedBook.rotation.z = -0.45;
  slantedBook.castShadow = true;
  shelvesGroup.add(slantedBook);

  // Cute developer rubber duck debug buddy on Shelf 2
  const duckGroup = new THREE.Group();
  duckGroup.position.set(0.1, 0.64, 0.05);

  const duckMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3 }); // gold/yellow
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xff4500, roughness: 0.4 });
  
  const duckBody = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), duckMat);
  duckBody.scale.set(1.2, 0.9, 0.9);
  duckBody.castShadow = true;
  duckGroup.add(duckBody);

  const duckHead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), duckMat);
  duckHead.position.set(-0.04, 0.07, 0);
  duckHead.castShadow = true;
  duckGroup.add(duckHead);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.04, 8), beakMat);
  beak.position.set(-0.085, 0.07, 0);
  beak.rotation.z = Math.PI / 2;
  duckGroup.add(beak);
  shelvesGroup.add(duckGroup);

  // Succulent/Plant on Shelf 2
  const shelfPlant = new THREE.Group();
  shelfPlant.position.set(0.8, 0.64, 0.05);
  
  // Pot
  const potGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.1, 8);
  const pot = new THREE.Mesh(potGeo, new THREE.MeshStandardMaterial({ color: plantPotColor, roughness: 0.8 }));
  pot.castShadow = true;
  shelfPlant.add(pot);
  
  // Succulent spheres
  const sucMat = new THREE.MeshStandardMaterial({ color: 0x3d704d, roughness: 0.8 });
  for (let j = 0; j < 5; j++) {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), sucMat);
    sphere.position.set((Math.random() - 0.5) * 0.06, 0.06, (Math.random() - 0.5) * 0.06);
    shelfPlant.add(sphere);
  }
  shelvesGroup.add(shelfPlant);

  roomGroup.add(shelvesGroup);

  /**
   * J. BRACKET NEON CODE SIGN ON RIGHT WALL
   */
  const neonSignGroup = new THREE.Group();
  neonSignGroup.position.set(0.75, 2.4, -3.32); // Flush on the right wall, shifted to make room for large kiddo frames

  const signBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.02), new THREE.MeshStandardMaterial({ color: 0x07090f, roughness: 0.9, transparent: true, opacity: 0.7 }));
  signBase.position.z = -0.01;
  neonSignGroup.add(signBase);

  // Left bracket "{" neon
  const bracketL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.02), matNeonSign);
  bracketL.position.set(-0.35, 0, 0.01);
  neonSignGroup.add(bracketL);
  
  const bracketLTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), matNeonSign);
  bracketLTop.position.set(-0.30, 0.185, 0.01);
  neonSignGroup.add(bracketLTop);

  const bracketLBot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), matNeonSign);
  bracketLBot.position.set(-0.30, -0.185, 0.01);
  neonSignGroup.add(bracketLBot);

  const bracketLMid = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.02), matNeonSign);
  bracketLMid.position.set(-0.38, 0, 0.01);
  neonSignGroup.add(bracketLMid);

  // Right bracket "}" neon
  const bracketR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.02), matNeonSign);
  bracketR.position.set(0.35, 0, 0.01);
  neonSignGroup.add(bracketR);
  
  const bracketRTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), matNeonSign);
  bracketRTop.position.set(0.30, 0.185, 0.01);
  neonSignGroup.add(bracketRTop);

  const bracketRBot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), matNeonSign);
  bracketRBot.position.set(0.30, -0.185, 0.01);
  neonSignGroup.add(bracketRBot);

  const bracketRMid = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.02), matNeonSign);
  bracketRMid.position.set(0.38, 0, 0.01);
  neonSignGroup.add(bracketRMid);

  // Code word "code" in the center (neon tubes)
  const codeWordMat = new THREE.MeshStandardMaterial({
    color: rgbNeonColor,
    emissive: rgbNeonColor,
    emissiveIntensity: 3.5,
    roughness: 0.1
  });
  materialsCache.neonCode = codeWordMat;
  
  const codeWord = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.02), codeWordMat);
  codeWord.position.set(0, 0, 0.01);
  neonSignGroup.add(codeWord);

  roomGroup.add(neonSignGroup);

  /**
   * K. COZY FLOOR MONSTERA PLANT & COZY SHAG CARPET
   */
  // Fluffy Rug underneath office chair
  const rugGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.02, 24);
  const rugMat = new THREE.MeshStandardMaterial({ color: 0x222a44, roughness: 0.95 }); // fluffy blue carpet
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.position.set(-0.7, 0.01, -0.3);
  rug.receiveShadow = true;
  roomGroup.add(rug);

  // Potted Monstera Houseplant
  const plantGroup = new THREE.Group();
  plantGroup.position.set(2.4, 0, 2.0); // right side foreground

  // Pot
  const pPot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.44, 12), new THREE.MeshStandardMaterial({ color: plantPotColor, roughness: 0.7 }));
  pPot.position.y = 0.22;
  pPot.castShadow = true;
  pPot.receiveShadow = true;
  plantGroup.add(pPot);

  const dirt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 10), new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.95 }));
  dirt.position.y = 0.42;
  plantGroup.add(dirt);

  // Dynamic stylized fan leaf mesh using spheres scaled flat and rotated
  const leafGeo = new THREE.SphereGeometry(0.24, 8, 8);
  const leafMat = new THREE.MeshStandardMaterial({ color: monsteraLeafColor, roughness: 0.8 });

  const leafOffsets = [
    { x: -0.15, y: 0.65, z: 0.05, rx: 0.4, ry: 0.2, rz: 0.6, scale: { x: 1.2, y: 0.02, z: 0.8 } },
    { x: 0.15, y: 0.75, z: -0.1, rx: -0.4, ry: -0.5, rz: -0.5, scale: { x: 1.4, y: 0.02, z: 0.9 } },
    { x: 0.0, y: 0.9, z: 0.15, rx: 0.5, ry: 1.2, rz: 0.2, scale: { x: 1.3, y: 0.02, z: 0.95 } },
    { x: -0.22, y: 0.46, z: -0.22, rx: -0.3, ry: 0.8, rz: 0.9, scale: { x: 1.0, y: 0.02, z: 0.7 } },
    { x: 0.25, y: 0.52, z: 0.25, rx: 0.2, ry: -0.8, rz: -0.8, scale: { x: 1.1, y: 0.02, z: 0.8 } }
  ];

  leafOffsets.forEach(lof => {
    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 6), leafMat);
    stem.position.set(lof.x * 0.4, 0.42 + (lof.y - 0.42) / 2, lof.z * 0.4);
    // point stem towards leaf
    stem.lookAt(new THREE.Vector3(lof.x, lof.y, lof.z));
    stem.rotation.x += Math.PI/2;
    stem.castShadow = true;
    plantGroup.add(stem);

    // Flat leaf
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(lof.x, lof.y, lof.z);
    leaf.scale.set(lof.scale.x, lof.scale.y, lof.scale.z);
    leaf.rotation.set(lof.rx, lof.ry, lof.rz);
    leaf.castShadow = true;
    plantGroup.add(leaf);
  });

  roomGroup.add(plantGroup);

  // 3D PHOTO FRAMES (Tech Stack grid on Left Wall)
  const frameGroup = new THREE.Group();
  
  const frameBorderMat = new THREE.MeshStandardMaterial({ color: 0x0f1118, roughness: 0.8 });
  
  const frameW = 0.6;
  const frameH = 0.6;
  const frameD = 0.04;

  const frameSpecs = [
    { tex: pythonTexture, y: 2.3, z: -1.4 },
    { tex: reactTexture, y: 2.3, z: -0.5 },
    { tex: jsTexture, y: 1.5, z: -1.4 },
    { tex: htmlTexture, y: 1.5, z: -0.5 }
  ];

  frameSpecs.forEach(spec => {
    const fGroup = new THREE.Group();
    fGroup.position.set(-3.34, spec.y, spec.z); // hanging flush on Left Wall X

    // Border outer box
    const border = new THREE.Mesh(new THREE.BoxGeometry(frameD, frameH, frameW), frameBorderMat);
    border.castShadow = true;
    fGroup.add(border);

    // Inner picture sheet
    const matPic = new THREE.MeshBasicMaterial({ map: spec.tex });
    const pic = new THREE.Mesh(new THREE.BoxGeometry(0.01, frameH - 0.08, frameW - 0.08), matPic);
    pic.position.x = 0.021; // shifted slightly forward to sit on frame front face
    fGroup.add(pic);

    frameGroup.add(fGroup);
  });

  roomGroup.add(frameGroup);

  // L. FRONT WALL FLOATING SHELVES (Left Wall, foreground Z space)
  const frontShelvesGroup = new THREE.Group();
  
  const fShelfWoodMat = new THREE.MeshStandardMaterial({ color: 0x2e1a0b, roughness: 0.5 }); // rich dark oak
  
  // Shelf 1: Lower Shelf (Y = 1.75, Z = 2.7, length = 1.0)
  const fShelf1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 1.0), fShelfWoodMat);
  fShelf1.position.set(-3.34, 1.75, 2.7);
  fShelf1.castShadow = true;
  fShelf1.receiveShadow = true;
  frontShelvesGroup.add(fShelf1);

  // Shelf 2: Upper Shelf (Y = 2.45, Z = 2.55, length = 0.7) - adjusted to avoid clipping the kiddo photo frame
  const fShelf2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.7), fShelfWoodMat);
  fShelf2.position.set(-3.34, 2.45, 2.55);
  fShelf2.castShadow = true;
  fShelf2.receiveShadow = true;
  frontShelvesGroup.add(fShelf2);

  // --- OBJECTS ON SHELF 1 (LOWER) ---
  // 1. Potted Cactus
  const cactusPotMat = new THREE.MeshStandardMaterial({ color: 0xcd7f32, roughness: 0.6 }); // Terracotta
  const cactusPot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.08, 8), cactusPotMat);
  cactusPot.position.set(-3.3, 1.83, 2.45);
  cactusPot.castShadow = true;
  frontShelvesGroup.add(cactusPot);

  const cactusMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
  const cactusBody = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 6), cactusMat);
  cactusBody.position.set(-3.3, 1.92, 2.45);
  cactusBody.castShadow = true;
  frontShelvesGroup.add(cactusBody);

  const cactusArm = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.04, 0.04), cactusMat);
  cactusArm.position.set(-3.3, 1.94, 2.48);
  frontShelvesGroup.add(cactusArm);

  // 2. Retro Game Boy
  const gameboyGroup = new THREE.Group();
  gameboyGroup.position.set(-3.3, 1.88, 2.9);
  gameboyGroup.rotation.y = 0.2; // slightly angled

  const gbBody = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.09), new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.5 })); // classic retro grey
  gbBody.castShadow = true;
  gameboyGroup.add(gbBody);

  const gbScreen = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.05, 0.07), new THREE.MeshBasicMaterial({ color: 0x8bac0f })); // classic green-tinted screen
  gbScreen.position.set(0.016, 0.04, 0);
  gameboyGroup.add(gbScreen);

  const dpad = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.02, 0.02), new THREE.MeshStandardMaterial({ color: 0x111111 }));
  dpad.position.set(0.016, -0.01, -0.02);
  gameboyGroup.add(dpad);

  const btnA = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.005, 6), new THREE.MeshStandardMaterial({ color: 0x991b1b }));
  btnA.position.set(0.016, -0.012, 0.015);
  btnA.rotation.z = Math.PI / 2;
  gameboyGroup.add(btnA);

  const btnB = btnA.clone();
  btnB.position.set(0.016, -0.02, 0.028);
  gameboyGroup.add(btnB);

  frontShelvesGroup.add(gameboyGroup);

  // --- OBJECTS ON SHELF 2 (UPPER) ---
  // 1. Smart Echo Speaker with blue neon ring
  const speaker = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 8), new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 }));
  speaker.position.set(-3.3, 2.49, 2.35);
  speaker.castShadow = true;
  frontShelvesGroup.add(speaker);

  const speakerRing = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.005, 8), new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
  speakerRing.position.set(-3.3, 2.51, 2.35);
  frontShelvesGroup.add(speakerRing);

  // 2. Space Robot Figurine
  const botGroup = new THREE.Group();
  botGroup.position.set(-3.3, 2.58, 2.75);
  botGroup.rotation.y = -0.45; // angled looking into room

  const botBody = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 8), new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.2, metalness: 0.5 })); // glossy white
  botBody.castShadow = true;
  botGroup.add(botBody);

  const botHead = new THREE.Mesh(new THREE.SphereGeometry(0.033, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.2, metalness: 0.5 }));
  botHead.position.y = 0.07;
  botHead.castShadow = true;
  botGroup.add(botHead);

  const botVisor = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.012, 0.035), new THREE.MeshBasicMaterial({ color: 0x00f2fe })); // glowing blue visor
  botVisor.position.set(0.03, 0.07, 0);
  botGroup.add(botVisor);

  frontShelvesGroup.add(botGroup);

  roomGroup.add(frontShelvesGroup);

  // M. THE KIDDO PHOTO FRAME (Large portrait frame on Left Wall, foreground)
  const kiddoFrameGroup = new THREE.Group();
  kiddoFrameGroup.position.set(-3.34, 2.35, 3.25); // Left wall, foreground

  const kiddoBorderMat = new THREE.MeshStandardMaterial({ color: 0x0c0d12, roughness: 0.8 }); // sleek black frame
  const kiddoBoardMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // white mat board border

  const frameWidth = 0.52; // along Z axis (calibrated to perfectly match kiddo.jpg's 9:16 aspect ratio!)
  const frameHeight = 0.8;  // along Y axis
  const frameDepth = 0.04;  // along X axis

  // 1. Black outer frame
  const kBorder = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, frameHeight, frameWidth), kiddoBorderMat);
  kBorder.castShadow = true;
  kiddoFrameGroup.add(kBorder);

  // 2. White passe-partout board
  const kBoard = new THREE.Mesh(new THREE.BoxGeometry(0.01, frameHeight - 0.06, frameWidth - 0.06), kiddoBoardMat);
  kBoard.position.x = 0.018; // sit slightly forward
  kiddoFrameGroup.add(kBoard);

  // 3. The kiddo photo itself
  const kiddoTexture = new THREE.TextureLoader().load('/kiddo.jpg');
  kiddoTexture.colorSpace = THREE.SRGBColorSpace;
  
  const kPhotoMat = new THREE.MeshBasicMaterial({ map: kiddoTexture });
  const kPhoto = new THREE.Mesh(new THREE.BoxGeometry(0.01, frameHeight - 0.16, frameWidth - 0.16), kPhotoMat);
  kPhoto.position.x = 0.021; // sit slightly forward
  kiddoFrameGroup.add(kPhoto);

  roomGroup.add(kiddoFrameGroup);

  // N. TWO LARGE KIDDO PHOTO FRAMES (On the Right Wall, empty space)
  const rightWallFramesGroup = new THREE.Group();

  const rFrameBorderMat = new THREE.MeshStandardMaterial({ color: 0x0c0d12, roughness: 0.8 }); // sleek black frame
  const rFrameBoardMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // white mat board border

  // Frame 1: kiddo2 (portrait, 2:3 aspect ratio)
  const f1Width = 0.76;
  const f1Height = 1.06;
  const f1Depth = 0.04;

  const f1Group = new THREE.Group();
  f1Group.position.set(1.85, 2.0, -3.34);

  const k2Border = new THREE.Mesh(new THREE.BoxGeometry(f1Width, f1Height, f1Depth), rFrameBorderMat);
  k2Border.castShadow = true;
  f1Group.add(k2Border);

  const k2Board = new THREE.Mesh(new THREE.BoxGeometry(f1Width - 0.06, f1Height - 0.06, 0.01), rFrameBoardMat);
  k2Board.position.z = 0.018; // sit slightly forward
  f1Group.add(k2Board);

  const kiddo2Texture = new THREE.TextureLoader().load('/kiddo2.png');
  kiddo2Texture.colorSpace = THREE.SRGBColorSpace;

  const k2PhotoMat = new THREE.MeshBasicMaterial({ map: kiddo2Texture });
  const k2Photo = new THREE.Mesh(new THREE.BoxGeometry(f1Width - 0.16, f1Height - 0.16, 0.01), k2PhotoMat);
  k2Photo.position.z = 0.021; // sit slightly forward
  f1Group.add(k2Photo);

  rightWallFramesGroup.add(f1Group);

  // Frame 2: kiddo3 (landscape, 3:2 aspect ratio - fixes disoriented squishing!)
  const f2Width = 1.06;
  const f2Height = 0.76;
  const f2Depth = 0.04;

  const f2Group = new THREE.Group();
  f2Group.position.set(2.85, 2.0, -3.34);

  const k3Border = new THREE.Mesh(new THREE.BoxGeometry(f2Width, f2Height, f2Depth), rFrameBorderMat);
  k3Border.castShadow = true;
  f2Group.add(k3Border);

  const k3Board = new THREE.Mesh(new THREE.BoxGeometry(f2Width - 0.06, f2Height - 0.06, 0.01), rFrameBoardMat);
  k3Board.position.z = 0.018; // sit slightly forward
  f2Group.add(k3Board);

  const kiddo3Texture = new THREE.TextureLoader().load('/kiddo3.png');
  kiddo3Texture.colorSpace = THREE.SRGBColorSpace;

  const k3PhotoMat = new THREE.MeshBasicMaterial({ map: kiddo3Texture });
  const k3Photo = new THREE.Mesh(new THREE.BoxGeometry(f2Width - 0.16, f2Height - 0.16, 0.01), k3PhotoMat);
  k3Photo.position.z = 0.021; // sit slightly forward
  f2Group.add(k3Photo);

  rightWallFramesGroup.add(f2Group);

  roomGroup.add(rightWallFramesGroup);

  // O. ITALIC NEON TEXT "Meri Choti si kiddo" (Mounted on Right Wall)
  const kiddoNeonGroup = new THREE.Group();

  // 1. Create high-resolution procedural canvas for neon cursive/italic text
  const neonTextCanvas = document.createElement('canvas');
  neonTextCanvas.width = 1024;
  neonTextCanvas.height = 256;
  const ntCtx = neonTextCanvas.getContext('2d');

  // Clear canvas transparent background
  ntCtx.fillStyle = 'rgba(0, 0, 0, 0)';
  ntCtx.fillRect(0, 0, 1024, 256);

  // Configure Lucida Calligraphy premium cursive font (increased size to 72px)
  const neonFontText = 'italic bold 72px "Lucida Calligraphy", cursive, sans-serif';
  ntCtx.font = neonFontText;
  ntCtx.textAlign = 'center';
  ntCtx.textBaseline = 'middle';

  // Layer A: Soft ambient halo glow (thinner stroke, reduced blur & opacity to maximize legibility)
  ntCtx.shadowColor = '#ff00aa'; 
  ntCtx.shadowBlur = 25;
  ntCtx.strokeStyle = 'rgba(255, 0, 170, 0.45)';
  ntCtx.lineWidth = 9;
  ntCtx.lineJoin = 'round';
  ntCtx.lineCap = 'round';
  ntCtx.strokeText('Meri Choti si kiddo', 512, 128);

  // Layer B: Intense plasma layer (narrower glow)
  ntCtx.shadowColor = '#ff33bb';
  ntCtx.shadowBlur = 12;
  ntCtx.strokeStyle = 'rgba(255, 51, 187, 0.7)';
  ntCtx.lineWidth = 4;
  ntCtx.strokeText('Meri Choti si kiddo', 512, 128);

  // Layer C: Core glowing gas tube (thin white-hot stroke, very tight white blur)
  ntCtx.shadowColor = '#ffffff';
  ntCtx.shadowBlur = 4;
  ntCtx.strokeStyle = '#ffffff';
  ntCtx.lineWidth = 1.5;
  ntCtx.strokeText('Meri Choti si kiddo', 512, 128);

  // Fill text with a clean, sharp white core (clear shadow blur to eliminate glow washout!)
  ntCtx.shadowBlur = 0;
  ntCtx.fillStyle = '#ffffff';
  ntCtx.fillText('Meri Choti si kiddo', 512, 128);

  // 2. Generate Three.js texture and glassmorphic emissive material
  const neonTextTexture = new THREE.CanvasTexture(neonTextCanvas);
  neonTextTexture.minFilter = THREE.LinearMipmapLinearFilter;
  neonTextTexture.magFilter = THREE.LinearFilter;

  const neonTextMat = new THREE.MeshBasicMaterial({
    map: neonTextTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false, // Prevents transparent card edges from clipping the wall
    blending: THREE.AdditiveBlending // Realistic light accumulation!
  });
  materialsCache.kiddoNeon = neonTextMat;

  // 3. Map to glass plane card (perfect 4:1 aspect ratio match)
  const neonTextGeo = new THREE.PlaneGeometry(1.6, 0.4);
  const neonTextMesh = new THREE.Mesh(neonTextGeo, neonTextMat);
  neonTextMesh.position.set(2.35, 2.75, -3.32); // flush on wall, slightly forward (brought low to 2.75!)
  kiddoNeonGroup.add(neonTextMesh);

  roomGroup.add(kiddoNeonGroup);

  // Add the loaded room group to the main scene
  scene.add(roomGroup);

  return roomGroup;
}

// Keep a local reference to THREE
let THREE = null;
function setThreeRef(threeInstance) {
  THREE = threeInstance;
}
