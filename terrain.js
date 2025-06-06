import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise2D } from 'simplex-noise';

// 创建噪声函数
const noise2D = createNoise2D();

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color('#000000');

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 创建光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 创建平面几何体
const geometry = new THREE.PlaneGeometry(300, 300, 100, 100);

// 创建材质
const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFD700'),
    wireframe: true,
    side: THREE.DoubleSide,
    metalness: 0.2,
    roughness: 0.8
});

// 创建网格
const terrainMesh = new THREE.Mesh(geometry, material);
terrainMesh.rotation.x = -Math.PI / 2;
terrainMesh.position.set(0, -10, 0);
scene.add(terrainMesh);

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

// 创建时钟对象
const clock = new THREE.Clock();

// 更新地形几何体的函数
function updateTerrainGeometry(time = 0) {
    const positions = geometry.attributes.position;
    const timeScale = 0.003;
    const waveSpeed = 0.02;

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        // 基础地形高度
        const baseHeight = noise2D(x / 150, y / 150) * 30;
        
        // 波浪效果
        const phaseShift = x * waveSpeed;
        const waveEffect = Math.sin(time * timeScale + phaseShift) * 10;
        
        // 设置顶点高度
        positions.setZ(i, baseHeight + waveEffect);
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
}

// 创建彩色地形材质的函数
function createColoredMaterial(wireframe = true) {
    return new THREE.MeshStandardMaterial({
        color: wireframe ? new THREE.Color('#FFD700') : new THREE.Color('#F4C430'),
        wireframe: wireframe,
        side: THREE.DoubleSide,
        metalness: 0.2,
        roughness: 0.8
    });
}

// 切换地形材质
function toggleTerrainMaterial() {
    const isWireframe = terrainMesh.material.wireframe;
    terrainMesh.material = createColoredMaterial(!isWireframe);
}

// 添加双击事件监听器
window.addEventListener('dblclick', toggleTerrainMaterial);

// 窗口大小变化时调整渲染器和相机
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // 获取经过的时间
    const elapsedTime = clock.getElapsedTime() * 1000;
    
    // 更新地形
    updateTerrainGeometry(elapsedTime);
    
    // 更新控制器
    controls.update();
    
    // 渲染场景
    renderer.render(scene, camera);
}

// 开始动画
animate(); 