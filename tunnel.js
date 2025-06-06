import * as THREE from 'three';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建一个完美对称的闭合曲线路径
const radius = 15;
const points = [];
const segments = 32; // 增加段数，使曲线更平滑
for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle * 2) * radius * 0.3;
    const z = Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, y, z));
}

const curve = new THREE.CatmullRomCurve3(points, true);
curve.tension = 0.5; // 调整曲线张力，使其更平滑

// 创建管道几何体
const geometry = new THREE.TubeGeometry(curve, 300, 1, 16, true); // 增加管道分段数

// 创建纹理加载器
const textureLoader = new THREE.TextureLoader();

// 加载PavingStones纹理
const pavingDiffuse = textureLoader.load('./assets/PavingStones141_1K-PNG/PavingStones141_1K-PNG_Color.png');
const pavingNormal = textureLoader.load('./assets/PavingStones141_1K-PNG/PavingStones141_1K-PNG_NormalGL.png');
const pavingRoughness = textureLoader.load('assets/PavingStones141_1K-PNG/PavingStones141_1K-PNG_Roughness.png');

// 设置纹理重复
pavingDiffuse.wrapS = pavingDiffuse.wrapT = THREE.RepeatWrapping;
pavingNormal.wrapS = pavingNormal.wrapT = THREE.RepeatWrapping;
pavingRoughness.wrapS = pavingRoughness.wrapT = THREE.RepeatWrapping;

pavingDiffuse.repeat.set(8, 1);
pavingNormal.repeat.set(8, 1);
pavingRoughness.repeat.set(8, 1);

// 创建默认材质（网格材质）
const gridMaterial = createGridMaterial();

// 创建PBR材质（带纹理贴图）
const pbrMaterial = new THREE.MeshStandardMaterial({
    map: pavingDiffuse,
    normalMap: pavingNormal,
    roughnessMap: pavingRoughness,
    side: THREE.BackSide,
    metalness: 0.0,
    roughness: 1.0
});

// 创建管道网格
const tube = new THREE.Mesh(geometry, gridMaterial);
scene.add(tube);

let t = 0;
let speed = 0.0005;
let showTexture = false;

// 创建网格材质的函数
function createGridMaterial() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;

    // 绘制纹理
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格线
    context.strokeStyle = '#00ff00';
    context.lineWidth = 1;

    // 绘制横向线条
    for (let i = 0; i < 20; i++) {
        const y = (i / 20) * canvas.height;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
    }

    // 绘制纵向线条
    for (let i = 0; i < 20; i++) {
        const x = (i / 20) * canvas.width;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 1);

    return new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.8
    });
}

// 添加环境光和方向光以更好地显示PBR材质
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 动画函数
function animate() {
    requestAnimationFrame(animate);

    // 使用 getPointAt 方法获取当前位置
    const currentPos = curve.getPointAt(t);
    camera.position.copy(currentPos);

    // 获取切线方向作为相机朝向
    const tangent = curve.getTangentAt(t);
    const lookAtPos = currentPos.clone().add(tangent.multiplyScalar(1));
    camera.lookAt(lookAtPos);

    // 更平滑地更新 t 值
    t = (t + speed) % 1;

    renderer.render(scene, camera);
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowDown') {
        speed = Math.min(speed - 0.0005, 0.005);
    } else if (e.code === 'ArrowUp') {
        speed = Math.max(speed + 0.0005, 0.0005);
    } else if (e.code === 'Space') {
        showTexture = !showTexture;
        tube.material = showTexture ? pbrMaterial : gridMaterial;
    }
});

// 窗口大小调整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 开始动画
animate();
