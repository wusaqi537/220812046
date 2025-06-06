import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// 场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.getElementById('container').appendChild(renderer.domElement);

// CSS2D渲染器设置
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.getElementById('container').appendChild(labelRenderer.domElement);

// 相机位置
camera.position.set(0, 50, 200);
camera.lookAt(50, 50, 0);

// 控制器设置
const controls = new OrbitControls(camera, labelRenderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enableRotate = true;
controls.enablePan = true;
controls.target.set(50, 50, 0);
controls.update();

// 创建柱状图
function createBar(dataArr) {
    const bars = new THREE.Group();
    
    dataArr.forEach((data, index) => {
        const geometry = new THREE.PlaneGeometry(10, data);
        const material = new THREE.MeshBasicMaterial({ 
            vertexColors: true,
            side: THREE.FrontSide
        });
        
        const positions = geometry.getAttribute('position');
        const colorArr = [];
        const color1 = new THREE.Color(0x00ff00);    // 绿色
        const color2 = new THREE.Color(0xffff00);    // 黄色
        const color3 = new THREE.Color(0xff0000);    // 红色
        
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            // 将y值归一化到0-1范围
            const normalizedY = (y / data + 0.5);
            let color;
            
            // 简单的三段式渐变
            if (normalizedY < 0.33) {
                color = color1; // 底部绿色
            } else if (normalizedY < 0.66) {
                const t = (normalizedY - 0.33) / 0.33;
                color = color1.clone().lerp(color2, t); // 中间绿到黄
            } else {
                const t = (normalizedY - 0.66) / 0.34;
                color = color2.clone().lerp(color3, t); // 顶部黄到红
            }
            
            colorArr.push(color.r, color.g, color.b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArr, 3));
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.x = index * 20 + 10 + 5;
        bar.position.y = data / 2;
        
        // 添加数值标签
        const labelDiv = document.createElement('div');
        labelDiv.className = 'label';
        labelDiv.textContent = data.toString();
        labelDiv.style.color = 'white';
        const label = new CSS2DObject(labelDiv);
        label.position.set(0, data/2 + 2, 0);
        bar.add(label);
        
        bars.add(bar);
    });
    
    return bars;
}

// 创建坐标轴
function createLine(type) {
    const points = [
        new THREE.Vector3(0, 0, 0)
    ];
    
    if (type === 'y') {
        points.push(new THREE.Vector3(0, 100, 0));
    } else {
        // x轴长度需要覆盖所有柱子
        const lastBarPosition = (data.length - 1) * 20 + 10 + 5;
        points.push(new THREE.Vector3(lastBarPosition + 10, 0, 0)); // 额外加10作为边距
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.Line(geometry, material);
    
    return line;
}

// 创建刻度线
function createScaleLine(type) {
    const points = [];
    
    if (type === 'y') {
        // Y轴刻度，每20个单位一个刻度
        for (let i = 0; i <= 100; i += 20) {
            points.push(new THREE.Vector3(0, i, 0));
            points.push(new THREE.Vector3(-5, i, 0));
        }
    } else {
        // X轴刻度，根据数据点数量生成刻度
        const spacing = 20;
        const numBars = data.length; // 使用数据数组的长度
        for (let i = 0; i < numBars; i++) {
            const x = i * spacing + 10 + 5; // 与createBar中的位置计算保持一致
            points.push(new THREE.Vector3(x, 0, 0));
            points.push(new THREE.Vector3(x, -5, 0));
        }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.LineSegments(geometry, material);
    
    return line;
}

// 创建图表
const data = [20, 45, 70, 85, 60, 35];
const chartGroup = new THREE.Group();

const xLine = createLine('x');
const yLine = createLine('y');
const xScaleLine = createScaleLine('x');
const yScaleLine = createScaleLine('y');
const bars = createBar(data);

chartGroup.add(xLine);
chartGroup.add(yLine);
chartGroup.add(xScaleLine);
chartGroup.add(yScaleLine);
chartGroup.add(bars);

scene.add(chartGroup);

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// 窗口大小调整处理
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

animate(); 