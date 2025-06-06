import * as THREE from 'three';

// 场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 相机位置
camera.position.z = 50;

// 创建粒子系统
function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const sizes = [];

    // 创建粒子
    for (let i = 0; i < 15000; i++) {
        // 创建螺旋形分布
        const radius = Math.random() * 50;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 20;

        const x = Math.cos(angle) * radius;
        const y = height;
        const z = Math.sin(angle) * radius;

        vertices.push(x, y, z);

        // 粉色系渐变
        const r = 0.8 + Math.random() * 0.2; // 红色基础值
        const g = 0.3 + Math.random() * 0.3; // 绿色较低
        const b = 0.6 + Math.random() * 0.4; // 蓝色中等
        colors.push(r, g, b);

        // 随机大小
        sizes.push(Math.random() * 2 + 0.5);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // 创建着色器材质
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            pixelRatio: { value: window.devicePixelRatio }
        },
        vertexShader: `
            uniform float time;
            uniform float pixelRatio;
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            
            void main() {
                vColor = color;
                vec3 pos = position;
                
                // 旋转效果
                float angle = time * 0.2;
                mat3 rotationMatrix = mat3(
                    cos(angle), 0.0, -sin(angle),
                    0.0, 1.0, 0.0,
                    sin(angle), 0.0, cos(angle)
                );
                pos = rotationMatrix * pos;
                
                // 上下浮动
                pos.y += sin(time + pos.x * 0.5) * 0.5;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // 设置点大小
                gl_PointSize = size * pixelRatio * (300.0 / length(mvPosition.xyz));
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float dist = length(2.0 * gl_PointCoord - 1.0);
                if (dist > 1.0) {
                    discard;
                }
                float alpha = 1.0 - dist;
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    return new THREE.Points(geometry, material);
}

const particles = createParticles();
scene.add(particles);

// 动画循环
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    // 更新时间
    const time = clock.getElapsedTime();
    particles.material.uniforms.time.value = time;

    // 相机自动旋转
    camera.position.x = Math.sin(time * 0.1) * 60;
    camera.position.z = Math.cos(time * 0.1) * 60;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// 处理窗口大小变化
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    particles.material.uniforms.pixelRatio.value = window.devicePixelRatio;
}

animate(); 