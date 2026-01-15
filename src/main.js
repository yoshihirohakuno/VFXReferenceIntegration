import { CameraManager } from './core/CameraManager.js';
import { Tracker } from './core/Tracker.js';
import { GestureRecognizer } from './core/GestureRecognizer.js';
import { ParticleSystem } from './vfx/ParticleSystem.js';
import GUI from 'lil-gui';

const videoElement = document.getElementById('input-video');
const canvasElement = document.getElementById('output-canvas');
const ctx = canvasElement.getContext('2d');
const loadingScreen = document.getElementById('ui-layer');

// UI/Debug settings
const settings = {
    showCamera: false,
    sensitivity: 1.0,
    particleCount: 1000,
    fullscreen: () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
};

const gui = new GUI();
gui.add(settings, 'showCamera').onChange((value) => {
    if (value) {
        videoElement.classList.add('visible');
    } else {
        videoElement.classList.remove('visible');
    }
});

gui.add(settings, 'sensitivity', 0.1, 5.0).onChange((val) => {
    gestureRecognizer.setSensitivity(val);
});

gui.add(settings, 'particleCount', 100, 5000).step(100).onChange((val) => {
    particleSystem.maxParticles = val;
});

gui.add(settings, 'fullscreen').name('Toggle Fullscreen');

const cameraManager = new CameraManager(videoElement);
const tracker = new Tracker();
const gestureRecognizer = new GestureRecognizer();
const particleSystem = new ParticleSystem();

let lastFireworkTime = 0;
const FIREWORK_COOLDOWN = 500; // ms

async function init() {
    try {
        // Simple click to start interaction
        loadingScreen.innerHTML = '<div style="color:white; font-size: 24px; cursor: pointer;">Click to Start Accessing Camera</div>';

        const startHandler = async () => {
            loadingScreen.innerHTML = '<div style="color:white;">Initializing Camera...</div>';
            try {
                await cameraManager.start();
                console.log('Camera started');
                loadingScreen.style.display = 'none'; // Hide overlay

                // Resize canvas to match window
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);

                loop();
            } catch (e) {
                console.error("Camera failed", e);
                loadingScreen.innerHTML = '<div style="color:red;">Camera Access Denied. Please refresh and allow access.</div>';
            }
        };

        document.body.addEventListener('click', startHandler, { once: true });

    } catch (e) {
        console.error("Initialization setup failed", e);
    }
}

function resizeCanvas() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
}

async function loop() {
    // Process tracking
    await tracker.process(videoElement);

    // Trail Fade Effect (Reference style)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Set Additive Blending for Particles
    ctx.globalCompositeOperation = 'lighter';

    // Update and Draw Particles
    particleSystem.update();
    particleSystem.draw(ctx);

    // Get latest point
    const point = tracker.getPrimaryPointer();
    const pinchState = tracker.getPinchStatus();

    // Visualize point & Interaction
    if (point) {
        // Mirror x because video is mirrored
        const x = (1 - point.x) * canvasElement.width;
        const y = point.y * canvasElement.height;

        // Debug Dot
        if (settings.showCamera) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = pinchState.isPinching ? 'lime' : 'red';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'lighter';
        }

        // Gesture Recognition
        const logicPoint = pinchState.isPinching ? { x: pinchState.x, y: pinchState.y } : point;
        const logicX = (1 - logicPoint.x) * canvasElement.width;
        const logicY = logicPoint.y * canvasElement.height;

        const gesture = gestureRecognizer.analyze(logicPoint, pinchState.isPinching, performance.now());

        if (gesture.type === 'FIREWORK_TRIGGER') {
            // Now launches a rocket instead of immediate explosion
            particleSystem.launchRocket(logicX, logicY);
        } else if (gesture.type === 'ROCKET_RISING') {
            // In new system, rocket handles its own trail. 
            // We could spawn extra "sparks" if we want, but Rocket class has a trail.
            // Maybe just a small sparkle at finger tip?
            // particleSystem.spawnSparkles(logicX, logicY, 2);
        } else if (gesture.type === 'STAR_WAND' || gesture.type === 'STAR') {
            // Sparkles based on movement speed ideally
            const speed = gesture.speed || 0; // if available from recognizer
            const amt = Math.max(5, Math.min(20, speed * 500));
            particleSystem.spawnSparkles(logicX, logicY, amt);
        }
    } else {
        gestureRecognizer.analyze(null, false, performance.now());
    }

    requestAnimationFrame(loop);
}

init();
