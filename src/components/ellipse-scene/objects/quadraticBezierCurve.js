import * as THREE from 'three';

const vector2 = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(100, 200),
    new THREE.Vector2(200, 0),
];
const curve = new THREE.QuadraticBezierCurve(vector2[0], vector2[1], vector2[2]);
const points = curve.getPoints(50);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({
    color: 0xff0000,
    //linewidth: 2,
});
const curveObject = new THREE.Line(geometry, material);
const geometry2 = new THREE.BufferGeometry().setFromPoints(points);
const material2 = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    size:5,
    //linewidth: 2,
});
const points2 = new THREE.Line(geometry2, material2);
curveObject.add(points2);
export default curveObject;