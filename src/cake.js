import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  TextureLoader,
  SpriteMaterial,
  Sprite,
  PointLight,
  AdditiveBlending,
  Raycaster,
  Vector2,
} from 'three';

const scene = new THREE.Scene();

// Create a dynamic background with multiple effects
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const context = canvas.getContext('2d');

// Function to create animated background
function createAnimatedBackground() {
  const time = Date.now() * 0.001;
  
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Create radial gradient
  const radialGradient = context.createRadialGradient(
    canvas.width / 2 + Math.sin(time * 0.2) * 50,  // Center X with movement
    canvas.height / 2 + Math.cos(time * 0.2) * 50, // Center Y with movement
    0,  // Inner radius
    canvas.width / 2 + Math.sin(time * 0.2) * 50,  // Center X with movement
    canvas.height / 2 + Math.cos(time * 0.2) * 50, // Center Y with movement
    canvas.width * 0.8  // Outer radius
  );
  
  // Add color stops with animation
  const pulse = Math.sin(time * 0.5) * 0.1;
  radialGradient.addColorStop(0, `rgba(20, 0, 0, ${0.8 + pulse})`);
  radialGradient.addColorStop(0.5, `rgba(10, 0, 0, ${0.6 + pulse})`);
  radialGradient.addColorStop(1, `rgba(5, 0, 0, ${0.4 + pulse})`);
  
  // Fill with radial gradient
  context.fillStyle = radialGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add animated fog effect
  const fogGradient = context.createLinearGradient(0, 0, 0, canvas.height);
  const fogOpacity = 0.35 + Math.sin(time * 0.3) * 0.1;
  fogGradient.addColorStop(0, `rgba(0, 0, 0, ${fogOpacity})`);
  fogGradient.addColorStop(0.5, `rgba(0, 0, 0, ${fogOpacity * 0.5})`);
  fogGradient.addColorStop(1, `rgba(0, 0, 0, ${fogOpacity})`);
  
  context.fillStyle = fogGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle noise
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 7;
    data[i] = Math.max(0, data[i] + noise);     // R
    data[i + 1] = Math.max(0, data[i + 1] + noise); // G
    data[i + 2] = Math.max(0, data[i + 2] + noise); // B
  }
  context.putImageData(imageData, 0, 0);
  
  // Update texture
  texture.needsUpdate = true;
  
  // Continue animation
  requestAnimationFrame(createAnimatedBackground);
}

// Create texture
const texture = new THREE.CanvasTexture(canvas);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
scene.background = texture;

// Start animation
createAnimatedBackground();

// Add dynamic fog
scene.fog = new THREE.FogExp2(0x000000, 0.018);

// Update fog density over time
function updateFog() {
  const time = Date.now() * 0.001;
  scene.fog.density = 0.018 + Math.sin(time * 0.2) * 0.005;
  requestAnimationFrame(updateFog);
}
updateFog();

// Add tick sound function
function playTick() {
  // Placeholder for tick sound effect
  // Could be implemented with Web Audio API or another audio file
}

// Add music player
const musicPlayer = document.createElement('audio');
musicPlayer.src = './music/the_loner.mp3';
musicPlayer.loop = true;
musicPlayer.volume = 0.5;

// Function to start music
async function startMusic() {
  try {
    // Try to play music immediately
    await musicPlayer.play();
  } catch (error) {
    console.log('Auto-play prevented:', error);
    // If autoplay is blocked, try to play on first user interaction
    const playOnInteraction = async () => {
      try {
        await musicPlayer.play();
        // Remove all event listeners after first play
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
      } catch (e) {
        console.log('Play failed:', e);
      }
    };
    
    // Add multiple event listeners to catch any user interaction
    document.addEventListener('click', playOnInteraction);
    document.addEventListener('keydown', playOnInteraction);
    document.addEventListener('touchstart', playOnInteraction);
  }
}

// Start music immediately
startMusic();

// Add music controls
const musicControls = document.createElement('div');
musicControls.style.position = 'fixed';
musicControls.style.bottom = '20px';
musicControls.style.right = '20px';
musicControls.style.zIndex = '1000';
musicControls.style.display = 'flex';
musicControls.style.gap = '10px';
musicControls.style.alignItems = 'center';

const playButton = document.createElement('button');
playButton.innerHTML = '▶';
playButton.style.background = 'rgba(255, 0, 0, 0.2)';
playButton.style.border = '1px solid rgba(255, 0, 0, 0.3)';
playButton.style.color = '#ff3333';
playButton.style.padding = '8px 12px';
playButton.style.borderRadius = '4px';
playButton.style.cursor = 'pointer';
playButton.style.fontFamily = 'Roomach, Arial, sans-serif';
playButton.onclick = () => musicPlayer.play();

const pauseButton = document.createElement('button');
pauseButton.innerHTML = '⏸';
pauseButton.style.background = 'rgba(255, 0, 0, 0.2)';
pauseButton.style.border = '1px solid rgba(255, 0, 0, 0.3)';
pauseButton.style.color = '#ff3333';
pauseButton.style.padding = '8px 12px';
pauseButton.style.borderRadius = '4px';
pauseButton.style.cursor = 'pointer';
pauseButton.style.fontFamily = 'Roomach, Arial, sans-serif';
pauseButton.onclick = () => musicPlayer.pause();

musicControls.appendChild(playButton);
musicControls.appendChild(pauseButton);
document.body.appendChild(musicControls);

// Listen for timer updates from index.html
window.addEventListener('message', (event) => {
  if (event.data === 'timerTick') {
    playTick();
  }
});

// Camera setup
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 4);

// Renderer with shadows and tone mapping
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

// Add warm ambient light
const hemiLight = new THREE.HemisphereLight(0xff1111, 0x050000, 0.5);
scene.add(hemiLight);

// Add subtle red point lights for atmosphere
const pointLight1 = new THREE.PointLight(0xff0000, 0.25, 8);
pointLight1.position.set(3, 2, 3);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff0000, 0.15, 8);
pointLight2.position.set(-3, 2, -3);
scene.add(pointLight2);

// Add a subtle blue light for contrast
const pointLight3 = new THREE.PointLight(0x0000ff, 0.1, 6);
pointLight3.position.set(0, 3, -2);
scene.add(pointLight3);

const ambient = new THREE.AmbientLight(0xff1111, 0.1);
scene.add(ambient);

// Floor to catch shadows
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 6;
controls.target.set(0, 0.75, 0);
controls.update();

let cake = null;

// Load cake model
const loader = new GLTFLoader();
loader.load('./models/cake.glb', (gltf) => {
  cake = gltf.scene;

  // Smooth shading and shadows
  cake.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
      
      // Force smooth shading on geometry
      node.geometry.computeVertexNormals();
      node.geometry.attributes.normal.needsUpdate = true;
      
      // Apply more aggressive smoothing
      if (node.material) {
        // Create new material with smooth settings
        const newMaterial = new THREE.MeshStandardMaterial({
          color: node.material.color || new THREE.Color(0xffffff),
          roughness: 0.5,
          metalness: 0,
          flatShading: false,
          side: THREE.DoubleSide,
        });
        
        // Copy any existing material properties
        if (node.material.map) newMaterial.map = node.material.map;
        if (node.material.normalMap) newMaterial.normalMap = node.material.normalMap;
        if (node.material.roughnessMap) newMaterial.roughnessMap = node.material.roughnessMap;
        if (node.material.metalnessMap) newMaterial.metalnessMap = node.material.metalnessMap;
        
        // Apply the new material
        node.material = newMaterial;
        node.material.needsUpdate = true;
      }
    }
  });

  cake.position.set(0, 0, 0);
  cake.scale.set(1.5, 1.5, 1.5);
  scene.add(cake);
  console.log('Cake loaded successfully');

  // Add realistic flickering flame after cake loads
  addFlame();
}, 
// Add progress callback
(progress) => {
  console.log('Loading cake:', (progress.loaded / progress.total * 100) + '%');
},
// Add error callback
(error) => {
  console.error('Error loading cake:', error);
});

//
// Flame setup and animation
//

function createFlameTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Create gradient
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 0, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const flameTexture = createFlameTexture();

let flameSprite = null;
let flameLight = null;
const flameBaseY = 1.6;

function addFlame() {
  const flameMaterial = new SpriteMaterial({
    map: flameTexture,
    color: 0xffaa33,
    transparent: true,
    blending: AdditiveBlending,
    opacity: 0.9,
  });

  flameSprite = new Sprite(flameMaterial);
  flameSprite.scale.set(0.2, 0.3, 1);
  flameSprite.position.set(0, flameBaseY, 0);
  scene.add(flameSprite);

  flameLight = new PointLight(0xffaa33, 1, 3);
  flameLight.position.set(0, flameBaseY, 0);
  scene.add(flameLight);
}

let flameAnimTime = 0;
function animateFlame() {
  if (!flameSprite || !flameLight) return;

  flameAnimTime += 0.05;

  // Flickering scale
  const scale =
    0.9 + 0.15 * Math.sin(flameAnimTime * 7) + 0.05 * (Math.random() - 0.5);
  flameSprite.scale.set(scale * 0.2, scale * 0.3, 1);

  // Slight vertical bobbing
  flameSprite.position.y = flameBaseY + 0.02 * Math.sin(flameAnimTime * 12);

  // Flickering light intensity and color warmth
  flameLight.intensity =
    1 + 0.4 * Math.sin(flameAnimTime * 10) + 0.1 * (Math.random() - 0.5);

  const flickerColorIntensity = 0.7 + 0.3 * Math.sin(flameAnimTime * 15);
  flameLight.color.setRGB(1, 0.6 * flickerColorIntensity, 0.3 * flickerColorIntensity);

  requestAnimationFrame(animateFlame);
}

animateFlame();

renderer.domElement.addEventListener('click', () => {
  if (flameSprite) {
    scene.remove(flameSprite);
    flameSprite = null;
  }
  if (flameLight) {
    scene.remove(flameLight);
    flameLight = null;
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add raycaster for click detection
const raycaster = new Raycaster();
const mouse = new Vector2();

// Add gift box and its contents
let giftBox = null;
let vinyl = null;
let letter = null;
let isGiftBoxOpen = false;
let isGiftBoxVisible = false;

// Create gift box using GLB model
function createGiftBox() {
  const giftBoxGroup = new THREE.Group();
  giftBoxGroup.userData.isGiftBox = true;
  
  // Load gift box model
  const loader = new GLTFLoader();
  loader.load('./models/gift_box_4.glb', (gltf) => {
    const giftBox = gltf.scene;
    
    // Smooth shading and shadows
    giftBox.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.geometry.computeVertexNormals();
        node.userData.isGiftBox = true;
      }
    });
    
    giftBox.scale.set(1.2, 1.2, 1.2);
    giftBoxGroup.add(giftBox);
    
    console.log('Gift box model loaded successfully');
  }, 
  (progress) => {
    console.log('Loading gift box:', (progress.loaded / progress.total * 100) + '%');
  },
  (error) => {
    console.error('Error loading gift box:', error);
  });
  
  giftBoxGroup.position.set(0, 0, 0);
  giftBoxGroup.visible = false;
  scene.add(giftBoxGroup);
  
  console.log('Gift box group created and added to scene');
  return giftBoxGroup;
}

// Create gift box
giftBox = createGiftBox();

// Create vinyl using GLB model
function createVinyl() {
  const vinylGroup = new THREE.Group();
  vinylGroup.userData.isVinyl = true;
  
  // Load vinyl model
  const loader = new GLTFLoader();
  loader.load('./models/12_vinyl_record.glb', (gltf) => {
    const vinyl = gltf.scene;
    
    // Smooth shading and shadows
    vinyl.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.geometry.computeVertexNormals();
        node.userData.isVinyl = true;
        node.userData.isClickable = true;
      }
    });
    
    vinyl.scale.set(2.0, 2.0, 2.0);
    vinylGroup.add(vinyl);
    
    console.log('Vinyl model loaded successfully');
  }, 
  (progress) => {
    console.log('Loading vinyl:', (progress.loaded / progress.total * 100) + '%');
  },
  (error) => {
    console.error('Error loading vinyl:', error);
  });
  
  vinylGroup.position.set(-1.5, 0.5, 0);
  vinylGroup.scale.set(2.5, 2.5, 2.5);
  vinylGroup.visible = false;
  vinylGroup.userData.isClickable = true;
  scene.add(vinylGroup);
  
  console.log('Vinyl group created and added to scene');
  return vinylGroup;
}

// Create vinyl
vinyl = createVinyl();

// Create letter using GLB model
function createLetter() {
  const letterGroup = new THREE.Group();
  letterGroup.userData.isLetter = true;
  
  // Load envelope model
  const loader = new GLTFLoader();
  loader.load('./models/envelope.glb', (gltf) => {
    const envelope = gltf.scene;
    
    // Smooth shading and shadows
    envelope.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.geometry.computeVertexNormals();
        node.userData.isLetter = true;
      }
    });
    
    envelope.scale.set(1.2, 1.2, 1.2);
    letterGroup.add(envelope);
    
    console.log('Envelope model loaded successfully');
  }, 
  (progress) => {
    console.log('Loading envelope:', (progress.loaded / progress.total * 100) + '%');
  },
  (error) => {
    console.error('Error loading envelope:', error);
  });
  
  letterGroup.position.set(1.5, 0.5, 0.1);
  letterGroup.scale.set(1.2, 1.2, 1.2);
  letterGroup.visible = false;
  scene.add(letterGroup);
  
  console.log('Letter group created and added to scene');
  return letterGroup;
}

// Create letter
letter = createLetter();

// Add instruction marquee
const instructionMarquee = document.createElement('div');
instructionMarquee.style.position = 'fixed';
instructionMarquee.style.top = '20px';
instructionMarquee.style.left = '50%';
instructionMarquee.style.transform = 'translateX(-50%)';
instructionMarquee.style.color = '#ff3333';
instructionMarquee.style.fontSize = '2rem';
instructionMarquee.style.fontFamily = 'Roomach, Arial, sans-serif';
instructionMarquee.style.textShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
instructionMarquee.style.zIndex = '1000';
instructionMarquee.style.whiteSpace = 'nowrap';
instructionMarquee.style.animation = 'marquee 8s linear infinite';
instructionMarquee.style.pointerEvents = 'none';

// Add marquee animation
const style = document.createElement('style');
style.textContent = `
  @keyframes marquee {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
`;
document.head.appendChild(style);

// Function to update instruction
function updateInstruction(text) {
  instructionMarquee.textContent = text;
}

// Function to remove instruction
function removeInstruction() {
  instructionMarquee.style.display = 'none';
}

// Add marquee to document
document.body.appendChild(instructionMarquee);

// Set initial instruction
updateInstruction('Make a wish and blow out the flame!');

// Add confetti function
function createConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '999';
  document.body.appendChild(confettiContainer);

  const colors = ['#ff0000', '#ff3333', '#000000', '#1a0000'];
  const confettiCount = 300;
  const shapes = ['square', 'circle', 'triangle'];

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    const size = Math.random() * 12 + 4;
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    confetti.style.position = 'absolute';
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '0px';
    confetti.style.opacity = Math.random() * 0.6 + 0.4;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    // Add shape-specific styles
    if (shape === 'circle') {
      confetti.style.borderRadius = '50%';
    } else if (shape === 'triangle') {
      confetti.style.width = '0';
      confetti.style.height = '0';
      confetti.style.backgroundColor = 'transparent';
      confetti.style.borderLeft = `${size/2}px solid transparent`;
      confetti.style.borderRight = `${size/2}px solid transparent`;
      confetti.style.borderBottom = `${size}px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
    }
    
    // Add shadow for depth
    confetti.style.boxShadow = '0 0 5px rgba(255, 0, 0, 0.3)';
    
    // Randomize animation duration and delay
    const duration = Math.random() * 3 + 3;
    const delay = Math.random() * 2;
    const swayAmount = Math.random() * 100 + 50;
    const swaySpeed = Math.random() * 2 + 1;
    
    // Create unique animation for each piece
    const animationName = `fall${i}`;
    const fallStyle = document.createElement('style');
    fallStyle.textContent = `
      @keyframes ${animationName} {
        0% {
          transform: translateY(0) translateX(0) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) translateX(${Math.random() > 0.5 ? swayAmount : -swayAmount}px) rotate(${Math.random() * 720}deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(fallStyle);
    
    confetti.style.animation = `${animationName} ${duration}s linear ${delay}s forwards`;
    confettiContainer.appendChild(confetti);
  }

  // Remove confetti after animation
  setTimeout(() => {
    confettiContainer.remove();
  }, 8000);
}

// Handle clicks
renderer.domElement.addEventListener('click', (event) => {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  console.log('Click detected at:', mouse.x, mouse.y);
  
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  
  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  console.log('Intersects:', intersects.length);
  
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    console.log('Clicked object:', clickedObject);
    console.log('Parent:', clickedObject.parent);
    console.log('Cake:', cake);
    console.log('Gift box:', giftBox);
    console.log('Is gift box visible:', isGiftBoxVisible);
    console.log('Is gift box open:', isGiftBoxOpen);
    
    // If cake is clicked and gift box isn't visible yet
    if (cake && clickedObject.parent === cake && !isGiftBoxVisible) {
      console.log('Cake clicked!');
      // Update instruction
      updateInstruction('Cut the cake!');
      
      // Remove flame
      if (flameSprite) {
        scene.remove(flameSprite);
        flameSprite = null;
      }
      if (flameLight) {
        scene.remove(flameLight);
        flameLight = null;
      }
      
      // Animate cake disappearance
      const duration = 1000;
      const startTime = Date.now();
      const startScale = cake.scale.clone();
      
      function animateCakeDisappear() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Scale down and fade out
        const scale = 1 - progress;
        cake.scale.set(
          startScale.x * scale,
          startScale.y * scale,
          startScale.z * scale
        );
        
        // Make cake transparent
        cake.traverse((node) => {
          if (node.isMesh && node.material) {
            node.material.transparent = true;
            node.material.opacity = 1 - progress;
          }
        });
        
        if (progress < 1) {
          requestAnimationFrame(animateCakeDisappear);
        } else {
          // Remove cake from scene
          scene.remove(cake);
          cake = null;
          
          // Show gift box
          if (giftBox) {
            console.log('Showing gift box');
            giftBox.visible = true;
            isGiftBoxVisible = true;
            updateInstruction('Click to open mystery box!');
            
            // Animate gift box appearance
            giftBox.position.y = -2;
            const targetY = 0;
            const duration = 1000;
            const startTime = Date.now();
            
            function animateGiftBox() {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              giftBox.position.y = -2 + (targetY + 2) * progress;
              
              if (progress < 1) {
                requestAnimationFrame(animateGiftBox);
              } else {
                console.log('Gift box appearance animation complete');
              }
            }
            
            animateGiftBox();
          } else {
            console.log('Gift box not loaded yet');
          }
        }
      }
      
      animateCakeDisappear();
    }
    // If gift box is clicked and not open yet
    else if (giftBox && (clickedObject.userData.isGiftBox || (clickedObject.parent && clickedObject.parent.userData.isGiftBox)) && !isGiftBoxOpen) {
      console.log('Gift box clicked!');
      isGiftBoxOpen = true;
      
      // Show final message
      const finalMessage = document.createElement('div');
      finalMessage.style.position = 'fixed';
      finalMessage.style.top = '20px';
      finalMessage.style.left = '50%';
      finalMessage.style.transform = 'translateX(-50%)';
      finalMessage.style.color = '#ff3333';
      finalMessage.style.fontSize = '2.5rem';
      finalMessage.style.fontFamily = 'Roomach, Arial, sans-serif';
      finalMessage.style.textShadow = '0 0 15px rgba(255, 0, 0, 0.7)';
      finalMessage.style.zIndex = '1000';
      finalMessage.style.animation = 'fadeIn 1s ease-in';
      finalMessage.textContent = 'Happy Birthday!';
      
      // Add fade in animation
      const fadeStyle = document.createElement('style');
      fadeStyle.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `;
      document.head.appendChild(fadeStyle);
      
      document.body.appendChild(finalMessage);
      
      // Remove the marquee
      removeInstruction();
      
      // Trigger confetti
      createConfetti();
      
      // Immediately remove gift box
      scene.remove(giftBox);
      giftBox = null;
      
      // Create and show vinyl
      if (!vinyl) {
        vinyl = createVinyl();
      }
      console.log('Showing vinyl');
      vinyl.visible = true;
      vinyl.position.set(-1.5, 0.5, 0);
      vinyl.scale.set(2.5, 2.5, 2.5);
      
      // Create and show letter
      if (!letter) {
        letter = createLetter();
      }
      console.log('Showing letter');
      letter.visible = true;
      letter.position.set(1.5, 0.5, 0.1);
      letter.scale.set(1.2, 1.2, 1.2);
      
      // Animate vinyl rising
      const vinylDuration = 1500;
      const vinylStartTime = Date.now();
      
      function animateVinyl() {
        const vinylElapsed = Date.now() - vinylStartTime;
        const vinylProgress = Math.min(vinylElapsed / vinylDuration, 1);
        
        vinyl.position.y = 0.5;
        vinyl.rotation.y = vinylProgress * Math.PI * 4;
        vinyl.scale.set(2.5 + 0.5 * vinylProgress, 2.5 + 0.5 * vinylProgress, 2.5 + 0.5 * vinylProgress);
        
        if (vinylProgress < 1) {
          requestAnimationFrame(animateVinyl);
        } else {
          console.log('Vinyl animation complete');
        }
      }
      
      animateVinyl();
    }
    // If vinyl is clicked
    else if (vinyl && (clickedObject.userData.isVinyl || clickedObject.userData.isClickable)) {
      console.log('Vinyl clicked!');
      
      // Move vinyl to center of screen while maintaining size
      vinyl.position.set(0, 0, 0);
      vinyl.scale.set(2.5, 2.5, 2.5);
      
      // If vinyl is clicked again, redirect to Spotify
      vinyl.userData.clicked = !vinyl.userData.clicked;
      if (vinyl.userData.clicked) {
        window.open('https://open.spotify.com/playlist/4lMdkXHRp8b8KmIy2nLcjJ?si=6d64864a465c4ac8&pt=5a06777079c23ed028ffc6b4f8e5b5a5', '_blank');
      }
    }
    // If envelope is clicked
    else if (letter && (clickedObject.userData.isLetter || (clickedObject.parent && clickedObject.parent.userData.isLetter))) {
      console.log('Letter clicked!');
      
      // Create and show letter message overlay
      const letterOverlay = document.createElement('div');
      letterOverlay.style.position = 'fixed';
      letterOverlay.style.top = '50%';
      letterOverlay.style.left = '50%';
      letterOverlay.style.transform = 'translate(-50%, -50%)';
      letterOverlay.style.backgroundColor = 'rgba(26, 0, 0, 0.95)';
      letterOverlay.style.padding = '2rem';
      letterOverlay.style.borderRadius = '1rem';
      letterOverlay.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.3)';
      letterOverlay.style.zIndex = '1000';
      letterOverlay.style.textAlign = 'center';
      letterOverlay.style.fontFamily = 'Roomach, Arial, sans-serif';
      letterOverlay.style.maxWidth = '80%';
      letterOverlay.style.border = '2px solid rgba(255, 0, 0, 0.3)';
      
      const letterContent = document.createElement('div');
      letterContent.innerHTML = `
        <h1 style="color: #ff3333; font-size: 2.5rem; margin-bottom: 1rem; text-shadow: 0 0 10px rgba(255, 0, 0, 0.3);">Happy Birthday!</h1>
        <p style="color: #ff6666; font-size: 1.2rem; line-height: 1.6;">
          Happy birthday! You're like old now :( Another year and you'll have early onset dementia(I hope not). Its ok we'll deal with it together. We've gotta play bingo after all. I appreciate you and I'm glad youre here. Im sorry the website is kinda rushed.I like you a lot and Im glad I met you.Happy 22nd!
        </p>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="margin-top: 1rem; padding: 0.5rem 1rem; 
                       background-color: #ff3333; color: #1a0000; 
                       border: none; border-radius: 0.5rem; 
                       cursor: pointer; font-size: 1rem;
                       font-family: 'Roomach', Arial, sans-serif;
                       font-weight: bold;
                       box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);">
          Close
        </button>
      `;
      
      letterOverlay.appendChild(letterContent);
      document.body.appendChild(letterOverlay);
    }
  }
});

// Update animate function to include gift box rotation
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate gift box slightly when visible
  if (giftBox && isGiftBoxVisible && !isGiftBoxOpen) {
    giftBox.rotation.y += 0.005;
  }
  
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Add subtle light animation
function animateLights() {
  const time = Date.now() * 0.001;
  pointLight1.intensity = 0.25 + Math.sin(time) * 0.05;
  pointLight2.intensity = 0.15 + Math.cos(time * 0.8) * 0.05;
  pointLight3.intensity = 0.1 + Math.sin(time * 1.2) * 0.03;
  requestAnimationFrame(animateLights);
}
animateLights();