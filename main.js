import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 3, 10);
camera.lookAt(0, 0, 0);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('container').appendChild(renderer.domElement);

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.8;
controls.zoomSpeed = 1.0;
controls.panSpeed = 0.8;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 1.5;

// 创建光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// 加载环境贴图
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('./assets/env/cubemap/');
const envMap = cubeTextureLoader.load([
    'px.jpg', 'nx.jpg',
    'py.jpg', 'ny.jpg',
    'pz.jpg', 'nz.jpg'
]);
scene.environment = envMap;
scene.background = envMap;

// 加载地球贴图
const earthTexture = new THREE.TextureLoader().load('./assets/earth_day_4096.jpg');

// 创建透明地板
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.1,
    envMap: envMap,
    envMapIntensity: 0.5
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 创建地球
const earthGeometry = new THREE.SphereGeometry(1.5, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.5,
    metalness: 0.5,
    envMap: envMap,
    envMapIntensity: 0.8
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.set(0, 2, 0);
earth.castShadow = true;
earth.userData.rotationSpeed = 0.001;
scene.add(earth);

// 创建立方体（带地球贴图）
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.7,
    metalness: 0.3,
    envMap: envMap,
    envMapIntensity: 1.0
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(-3, 1, 0);
cube.castShadow = true;
scene.add(cube);

// 创建八面体（带地球贴图）
const octahedronGeometry = new THREE.OctahedronGeometry(1);
const octahedronMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.3,
    metalness: 0.7,
    envMap: envMap,
    envMapIntensity: 1.2
});
const octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
octahedron.position.set(3, 1, 0);
octahedron.castShadow = true;
scene.add(octahedron);

// 创建网格辅助器
const gridHelper = new THREE.GridHelper(100, 100, 0x00ffff, 0x004444);
gridHelper.material.opacity = 0.25;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// 创建坐标轴辅助器
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// 动画状态
const params = {
    animation: {
        enabled: true,
        speed: 1
    },
    earth: {
        rotationSpeed: 0.001,
        roughness: 0.5,
        metalness: 0.5,
        envMapIntensity: 0.8,
        position: {
            x: 0,
            y: 2,
            z: 0
        }
    },
    cube: {
        rotationSpeed: 0.01,
        roughness: 0.7,
        metalness: 0.3,
        envMapIntensity: 1.0,
        position: {
            x: -3,
            y: 1,
            z: 0
        }
    },
    octahedron: {
        rotationSpeed: 0.01,
        roughness: 0.3,
        metalness: 0.7,
        envMapIntensity: 1.2,
        position: {
            x: 3,
            y: 1,
            z: 0
        }
    },
    floor: {
        opacity: 0.1,
        visible: true
    },
    lights: {
        ambient: {
            intensity: 0.5,
            color: '#ffffff'
        },
        directional: {
            intensity: 1.0,
            color: '#ffffff',
            position: {
                x: 10,
                y: 10,
                z: 10
            }
        }
    }
};

// 创建GUI
const gui = new GUI();

// 动画控制
const animationFolder = gui.addFolder('动画控制');
animationFolder.add(params.animation, 'enabled').name('启用动画');
animationFolder.add(params.animation, 'speed', 0.1, 2).name('动画速度');

// 地球控制
const earthFolder = gui.addFolder('地球控制');
earthFolder.add(params.earth, 'rotationSpeed', 0.0001, 0.005).name('自转速度');
earthFolder.add(params.earth, 'roughness', 0, 1).name('粗糙度').onChange(value => {
    earthMaterial.roughness = value;
});
earthFolder.add(params.earth, 'metalness', 0, 1).name('金属度').onChange(value => {
    earthMaterial.metalness = value;
});
earthFolder.add(params.earth, 'envMapIntensity', 0, 2).name('环境反射').onChange(value => {
    earthMaterial.envMapIntensity = value;
});

// 添加地球位置控制
const earthPositionFolder = earthFolder.addFolder('位置');
earthPositionFolder.add(params.earth.position, 'x', -10, 10).name('X').onChange(value => {
    earth.position.x = value;
});
earthPositionFolder.add(params.earth.position, 'y', 0, 10).name('Y').onChange(value => {
    earth.position.y = value;
});
earthPositionFolder.add(params.earth.position, 'z', -10, 10).name('Z').onChange(value => {
    earth.position.z = value;
});

// 立方体控制
const cubeFolder = gui.addFolder('立方体控制');
cubeFolder.add(params.cube, 'rotationSpeed', 0.001, 0.05).name('旋转速度');
cubeFolder.add(params.cube, 'roughness', 0, 1).name('粗糙度').onChange(value => {
    cubeMaterial.roughness = value;
});
cubeFolder.add(params.cube, 'metalness', 0, 1).name('金属度').onChange(value => {
    cubeMaterial.metalness = value;
});
cubeFolder.add(params.cube, 'envMapIntensity', 0, 2).name('环境反射').onChange(value => {
    cubeMaterial.envMapIntensity = value;
});

// 添加立方体位置控制
const cubePositionFolder = cubeFolder.addFolder('位置');
cubePositionFolder.add(params.cube.position, 'x', -10, 10).name('X').onChange(value => {
    cube.position.x = value;
});
cubePositionFolder.add(params.cube.position, 'y', 0, 10).name('Y').onChange(value => {
    cube.position.y = value;
});
cubePositionFolder.add(params.cube.position, 'z', -10, 10).name('Z').onChange(value => {
    cube.position.z = value;
});

// 八面体控制
const octahedronFolder = gui.addFolder('八面体控制');
octahedronFolder.add(params.octahedron, 'rotationSpeed', 0.001, 0.05).name('旋转速度');
octahedronFolder.add(params.octahedron, 'roughness', 0, 1).name('粗糙度').onChange(value => {
    octahedronMaterial.roughness = value;
});
octahedronFolder.add(params.octahedron, 'metalness', 0, 1).name('金属度').onChange(value => {
    octahedronMaterial.metalness = value;
});
octahedronFolder.add(params.octahedron, 'envMapIntensity', 0, 2).name('环境反射').onChange(value => {
    octahedronMaterial.envMapIntensity = value;
});

// 添加八面体位置控制
const octahedronPositionFolder = octahedronFolder.addFolder('位置');
octahedronPositionFolder.add(params.octahedron.position, 'x', -10, 10).name('X').onChange(value => {
    octahedron.position.x = value;
});
octahedronPositionFolder.add(params.octahedron.position, 'y', 0, 10).name('Y').onChange(value => {
    octahedron.position.y = value;
});
octahedronPositionFolder.add(params.octahedron.position, 'z', -10, 10).name('Z').onChange(value => {
    octahedron.position.z = value;
});

// 地板控制
const floorFolder = gui.addFolder('地板控制');
floorFolder.add(params.floor, 'opacity', 0, 1).name('透明度').onChange(value => {
    floorMaterial.opacity = value;
});
floorFolder.add(params.floor, 'visible').name('显示地板').onChange(value => {
    floor.visible = value;
});

// 光源控制
const lightsFolder = gui.addFolder('光源控制');
const ambientFolder = lightsFolder.addFolder('环境光');
ambientFolder.addColor(params.lights.ambient, 'color').name('颜色').onChange(value => {
    ambientLight.color.set(value);
});
ambientFolder.add(params.lights.ambient, 'intensity', 0, 2).name('强度').onChange(value => {
    ambientLight.intensity = value;
});

const directionalFolder = lightsFolder.addFolder('方向光');
directionalFolder.addColor(params.lights.directional, 'color').name('颜色').onChange(value => {
    directionalLight.color.set(value);
});
directionalFolder.add(params.lights.directional, 'intensity', 0, 2).name('强度').onChange(value => {
    directionalLight.intensity = value;
});
directionalFolder.add(params.lights.directional.position, 'x', -20, 20).name('X位置').onChange(value => {
    directionalLight.position.x = value;
});
directionalFolder.add(params.lights.directional.position, 'y', -20, 20).name('Y位置').onChange(value => {
    directionalLight.position.y = value;
});
directionalFolder.add(params.lights.directional.position, 'z', -20, 20).name('Z位置').onChange(value => {
    directionalLight.position.z = value;
});

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    if (params.animation.enabled) {
        // 地球自转
        earth.rotation.y += params.earth.rotationSpeed * params.animation.speed;
        
        // 其他物体旋转
        cube.rotation.y += params.cube.rotationSpeed * params.animation.speed;
        octahedron.rotation.y += params.octahedron.rotationSpeed * params.animation.speed;
    }

    controls.update();
    renderer.render(scene, camera);
}

// 窗口大小变化处理
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// 键盘控制
window.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            params.animation.enabled = !params.animation.enabled;
            break;
        case 'ArrowUp':
            params.animation.speed = Math.min(params.animation.speed + 0.1, 2.0);
            break;
        case 'ArrowDown':
            params.animation.speed = Math.max(params.animation.speed - 0.1, 0.1);
            break;
    }
});

// 开始动画
animate(); 