import * as THREE from 'three';

// 定义控制点
const vector2 = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(100, 100),
    new THREE.Vector2(100, 0),
    //new THREE.Vector2(0, 100),
];

// 创建样条曲线
const curve = new THREE.SplineCurve(vector2);
const points = curve.getPoints(50);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 2
});

// 创建线对象
const splineCurve = new THREE.Line(geometry, material);

// 添加曲线上的点
const pointsMaterial = new THREE.PointsMaterial({
    color: 0x00ff00,
    size: 2
});
const pointsObject = new THREE.Points(geometry, pointsMaterial);

// 添加控制点
const controlPointsGeometry = new THREE.BufferGeometry().setFromPoints(vector2);
const controlPointsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 5
});
const controlPointsObject = new THREE.Points(controlPointsGeometry, controlPointsMaterial);

// 创建一个组来包含线和点
const group = new THREE.Group();
group.add(splineCurve);
group.add(pointsObject);
group.add(controlPointsObject);

export default group;
