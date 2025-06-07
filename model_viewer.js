import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);  // 黑色背景

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 3);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 创建控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 获取进度条元素
const progressContainer = document.getElementById('progress-container');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');

// 创建GLTF加载器
const loader = new GLTFLoader();

// 用于存储模型的所有网格
let modelMeshes = [];
let isWireframe = false;

// 创建动画混合器
let mixer = null;
const clock = new THREE.Clock();  // 用于计算动画delta时间

// 存储需要更新的对象
let modelGroup = {
    model: null,
    box: new THREE.Box3(),
    boxHelper: null,
    boxMesh: null,
    frontBoxMesh: null,
    ringMesh: null
};

// 加载模型
progressContainer.style.display = 'block';

loader.load(
    './assets/models/人物.gltf',
    function (gltf) {
        const model = gltf.scene;
        modelGroup.model = model;
        
        // 增加模型缩放
        const scale = 1; // 显著增加缩放比例
        model.scale.set(scale, scale, scale);
        model.position.set(0, 0, 0);
        model.position.y += 1; // 向上移动1个单位
        model.position.x -= 2; // 向左移动2个单位
        
        // 强制更新模型矩阵
        model.updateMatrixWorld(true);
        
        // 遍历模型中的所有网格
        model.traverse((obj) => {
            if (obj.isMesh) {
                obj.userData.originalMaterial = obj.material.clone();
                obj.userData.wireframeMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    wireframe: true,
                    transparent: true,
                    opacity: 1,
                    depthTest: false,
                    depthWrite: false
                });
                modelMeshes.push(obj);
            }
        });

        // 将模型添加到场景
        scene.add(model);

        // 初始化包围盒
        updateBoundingBox();

        // 设置动画
        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            
            // 查找idle动画
            const idleAnimation = gltf.animations.find(anim => anim.name.toLowerCase().includes('idle'));
            
            if (idleAnimation) {
                // 如果找到idle动画，只播放这个
                const action = mixer.clipAction(idleAnimation);
                action.play();
            } else {
                // 如果没有找到idle动画，播放第一个动画
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
            }
            
            console.log('可用动画:', gltf.animations.map(a => a.name));
        }
        
        // 隐藏进度条
        progressContainer.style.display = 'none';
    },
    function (xhr) {
        // 更新进度条
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        progressBarFill.style.width = percentComplete + '%';
        progressText.textContent = `加载中... ${Math.round(percentComplete)}%`;
    },
    function (error) {
        console.error('模型加载失败:', error);
        progressContainer.style.display = 'none';
        progressText.textContent = '加载失败，请刷新页面重试';
    }
);

// 更新包围盒和相关对象
function updateBoundingBox() {
    if (!modelGroup.model) return;

    // 强制更新模型的世界矩阵
    modelGroup.model.updateWorldMatrix(true, true);

    // 使用setFromObject来获取初始包围盒
    const tempBox = new THREE.Box3().setFromObject(modelGroup.model);

    // 更新主包围盒
    modelGroup.box.copy(tempBox);
    
    const size = new THREE.Vector3();
    modelGroup.box.getSize(size);
    const center = new THREE.Vector3();
    modelGroup.box.getCenter(center);

    console.log('包围盒信息:', {
        size: size.toArray(),
        center: center.toArray(),
        modelPosition: modelGroup.model.position.toArray(),
        modelScale: modelGroup.model.scale.toArray(),
        min: modelGroup.box.min.toArray(),
        max: modelGroup.box.max.toArray()
    });

    // 更新包围盒网格
    if (!modelGroup.boxMesh) {
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const boxMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            opacity: 0.1,
            transparent: true,
            depthWrite: false,
            side: THREE.BackSide
        });
        modelGroup.boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        scene.add(modelGroup.boxMesh);

        const frontBoxMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            opacity: 0.1,
            transparent: true,
            depthWrite: false,
            side: THREE.FrontSide
        });
        modelGroup.frontBoxMesh = new THREE.Mesh(boxGeometry, frontBoxMaterial);
        scene.add(modelGroup.frontBoxMesh);
    }

    // 更新包围盒网格的大小和位置
    modelGroup.boxMesh.scale.copy(size);
    modelGroup.boxMesh.position.copy(center);
    modelGroup.frontBoxMesh.scale.copy(size);
    modelGroup.frontBoxMesh.position.copy(center);

    // 更新或创建底部环形
    const ringRadius = Math.max(size.x, size.z) * 0.6;
    
    if (!modelGroup.ringMesh) {
        const ringGeometry = new THREE.RingGeometry(ringRadius, ringRadius + 0.2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
        });
        modelGroup.ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        modelGroup.ringMesh.rotateX(Math.PI / 2);
        scene.add(modelGroup.ringMesh);
    } else {
        // 更新环形大小
        const newRingGeometry = new THREE.RingGeometry(ringRadius, ringRadius + 0.2, 32);
        modelGroup.ringMesh.geometry.dispose();
        modelGroup.ringMesh.geometry = newRingGeometry;
    }
    
    // 更新环形位置
    modelGroup.ringMesh.position.set(center.x, modelGroup.box.min.y + 0.01, center.z);
}

// 切换网格显示模式
function toggleWireframe() {
    isWireframe = !isWireframe;
    modelMeshes.forEach((mesh) => {
        mesh.material = isWireframe ? 
            mesh.userData.wireframeMaterial : 
            mesh.userData.originalMaterial;
    });
}

// 处理键盘事件
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        toggleWireframe();
    }
});

// 处理窗口大小变化
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
        
        // 在每次动画更新后立即更新包围盒
        updateBoundingBox();
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();