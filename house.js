// 场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 添加天空盒子
function createSkyBox() {
    // 创建渐变纹理
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    // 创建渐变
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1e4877');   // 顶部深蓝色
    gradient.addColorStop(0.5, '#4584b4');  // 中间蓝色
    gradient.addColorStop(1, '#add8e6');   // 底部浅蓝色

    // 填充渐变
    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);

    // 创建纹理
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    // 创建天空球体
    const skyGeometry = new THREE.SphereGeometry(1500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
    });

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // 添加一点雾效果使地平线过渡更自然
    scene.fog = new THREE.Fog(0xadd8e6, 500, 1500);
}

// 相机位置
camera.position.set(10, 5, 10);
camera.lookAt(0, 0, 0);

// 控制器设置
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 8, 5);  // 调整光源位置以获得更好的阴影效果
directionalLight.castShadow = true;

// 配置阴影属性
directionalLight.shadow.mapSize.width = 2048;  // 增加阴影贴图的分辨率
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
directionalLight.shadow.bias = -0.001;  // 减少阴影失真

scene.add(directionalLight);

// 加载纹理
const textureLoader = new THREE.TextureLoader();

// 添加地面
function createGround() {
    const grassTexture = textureLoader.load('./assets/Grass005_1K-JPG/Grass005_1K-JPG_Color.jpg');
    const grassNormal = textureLoader.load('./assets/Grass005_1K-JPG/Grass005_1K-JPG_NormalGL.jpg');
    
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassNormal.wrapS = grassNormal.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(200, 200);  // 增加重复次数
    grassNormal.repeat.set(200, 200);

    // 创建一个更大的地面
    const groundGeometry = new THREE.PlaneGeometry(1200, 1200);  // 显著增加地面大小
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: grassTexture,
        normalMap: grassNormal
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 添加远处的雾效果，使地面自然地融入天空
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.002);  // 使用淡蓝色的雾
}

// 添加房子
function createHouse() {
    // 房子尺寸
    const width = 8;
    const height = 6;
    const depth = 8;

    // 加载砖墙纹理
    const brickTexture = textureLoader.load('./assets/brick/Bricks092_1K-PNG_Color.png');
    const brickNormal = textureLoader.load('./assets/brick/Bricks092_1K-PNG_NormalGL.png');
    
    brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
    brickNormal.wrapS = brickNormal.wrapT = THREE.RepeatWrapping;
    brickTexture.repeat.set(2, 2);
    brickNormal.repeat.set(2, 2);

    const wallMaterial = new THREE.MeshStandardMaterial({
        map: brickTexture,
        normalMap: brickNormal,
        side: THREE.DoubleSide
    });

    // 创建前墙（带洞）
    const frontWallShape = new THREE.Shape();
    frontWallShape.moveTo(-width/2, 0);
    frontWallShape.lineTo(-width/2, height);
    frontWallShape.lineTo(width/2, height);
    frontWallShape.lineTo(width/2, 0);
    frontWallShape.lineTo(-width/2, 0);

    // 添加门洞
    const doorWidth = 3.4;
    const doorHeight = 3.8;
    const doorPath = new THREE.Path();
    doorPath.moveTo(-doorWidth/2, 0);
    doorPath.lineTo(-doorWidth/2, doorHeight);
    doorPath.lineTo(doorWidth/2, doorHeight);
    doorPath.lineTo(doorWidth/2, 0);
    frontWallShape.holes.push(doorPath);

    // 添加窗户洞
    const windowWidth = 1.5;
    const windowHeight = 1.2;
    const windowY = height/2 + 1.5;

    // 左窗户
    const leftWindowPath = new THREE.Path();
    leftWindowPath.moveTo(-2 - windowWidth/2, windowY - windowHeight/2);
    leftWindowPath.lineTo(-2 - windowWidth/2, windowY + windowHeight/2);
    leftWindowPath.lineTo(-2 + windowWidth/2, windowY + windowHeight/2);
    leftWindowPath.lineTo(-2 + windowWidth/2, windowY - windowHeight/2);
    frontWallShape.holes.push(leftWindowPath);

    // 右窗户
    const rightWindowPath = new THREE.Path();
    rightWindowPath.moveTo(2 - windowWidth/2, windowY - windowHeight/2);
    rightWindowPath.lineTo(2 - windowWidth/2, windowY + windowHeight/2);
    rightWindowPath.lineTo(2 + windowWidth/2, windowY + windowHeight/2);
    rightWindowPath.lineTo(2 + windowWidth/2, windowY - windowHeight/2);
    frontWallShape.holes.push(rightWindowPath);

    // 创建前墙
    const frontWallGeometry = new THREE.ShapeGeometry(frontWallShape);
    
    // 手动设置UV，使其与PlaneGeometry的UV映射一致
    const uvs = frontWallGeometry.attributes.uv;
    const positions = frontWallGeometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        // 将坐标映射到[0,1]范围
        const u = (x + width/2) / width;
        const v = y / height;
        
        uvs.setXY(i, u, v);
    }

    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.z = depth/2;
    frontWall.castShadow = true;  // 添加投影
    frontWall.receiveShadow = true;  // 接收阴影
    scene.add(frontWall);

    // 创建后墙（实心）
    const backWallGeometry = new THREE.PlaneGeometry(width, height);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, height/2, -depth/2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    scene.add(backWall);

    // 创建左右墙
    const sideWallGeometry = new THREE.PlaneGeometry(depth, height);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-width/2, height/2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(width/2, height/2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // 添加玻璃窗
    const windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });

    const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);

    const frontWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow1.position.set(-2, windowY, depth/2);
    frontWindow1.castShadow = false;  // 窗户也投射阴影
    scene.add(frontWindow1);

    const frontWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow2.position.set(2, windowY, depth/2);
    frontWindow2.castShadow = false;
    scene.add(frontWindow2);

    // 添加门
    const doorTexture = textureLoader.load('./assets/wood/Door002_1K-PNG_Color.png');
    const doorNormal = textureLoader.load('./assets/wood/Door002_1K-PNG_NormalGL.png');
    
    const doorMaterial = new THREE.MeshStandardMaterial({
        map: doorTexture,
        normalMap: doorNormal,
        side: THREE.DoubleSide
    });

    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(doorWidth, doorHeight),
        doorMaterial
    );
    door.position.set(0, doorHeight/2, depth/2);
    door.castShadow = true;  // 门也投射阴影
    scene.add(door);

    // 创建屋顶
    const roofTexture = textureLoader.load('./assets/roof/RoofingTiles010_1K-PNG_Color.png');
    const roofNormal = textureLoader.load('./assets/roof/RoofingTiles010_1K-PNG_NormalGL.png');
    
    roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping;
    roofNormal.wrapS = roofNormal.wrapT = THREE.RepeatWrapping;
    roofTexture.repeat.set(4, 4);
    roofNormal.repeat.set(4, 4);

    const roofSize = Math.sqrt(width * width + depth * depth) * 0.6;
    const roofHeight = height/2;
    const roofGeometry = new THREE.ConeGeometry(roofSize, roofHeight, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
        map: roofTexture,
        normalMap: roofNormal
    });

    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + height/4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;  // 屋顶投射阴影
    roof.receiveShadow = true;  // 屋顶接收阴影
    scene.add(roof);
}

// 创建场景元素
createGround();
createHouse();
createSkyBox(); 
// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 处理窗口大小变化
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate(); 