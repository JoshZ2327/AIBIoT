import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 🎯 Setup Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// 🎯 Attach 3D Render to Digital Twin UI Container
document.getElementById("digital-twin-container").appendChild(renderer.domElement);

// 🎯 Load 3D Model
const loader = new GLTFLoader();
let model;
loader.load('/models/digital_twin_model.glb', (gltf) => {
    model = gltf.scene;
    scene.add(model);
}, undefined, (error) => {
    console.error('❌ Error loading 3D model:', error);
});

// 📌 Camera Positioning
camera.position.z = 5;

// 🎯 Fetch Digital Twin Data and Update 3D Visualization
async function fetchDigitalTwinData() {
    try {
        const response = await fetch(`${BACKEND_URL}/get-digital-twin-3d?asset_name=Machine1`);
        const data = await response.json();

        if (model) {
            model.traverse((child) => {
                if (child.isMesh) {
                    if (data.sensor_data.temperature > data.ai_thresholds.adjusted_threshold) {
                        child.material.color.setHex(0xff0000);  // 🔴 Red if anomaly detected
                    } else {
                        child.material.color.setHex(0x00ff00);  // 🟢 Green if normal
                    }
                }
            });
        }
    } catch (error) {
        console.error("❌ Error fetching Digital Twin Data:", error);
    }
}

// 📡 WebSocket for real-time updates
const socket = new WebSocket(`${BACKEND_URL}/ws/iot`);
socket.onmessage = () => fetchDigitalTwinData();

// 🎯 Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
