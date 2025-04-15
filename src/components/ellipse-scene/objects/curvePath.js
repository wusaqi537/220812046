import *as THREE from 'three';
const p1=new THREE.Vector2(0,200);
const p2=new THREE.Vector2(100,100);
const line1=new THREE.LineCurve3(p1,p2);
const p3=new THREE.Vector3(0,200);
const p4=new THREE.Vector3(-100,100);
const line2=new THREE.LineCurve3(p3,p4);
const elispse=new THREE.EllipseCurve(0,0,100,100,0,Math.PI,false,0);
const curvePath = new THREE.CurvePath();
curvePath.add(line1);
curvePath.add(line2);
curvePath.add(elispse);
curvePath.getPoints(20);
const geometry = new THREE.BufferGeometry().setFromPoints(curvePath.getPoints(20));
const line = new THREE.Line(
    geometry,new THREE.LineBasicMaterial({ color: 0xff0000 })
);
export default line;