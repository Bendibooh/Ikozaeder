import React, { useRef, useEffect } from 'react';
import './App.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const icoGeometry = new THREE.IcosahedronGeometry(1);
    const icoMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
    scene.add(icosahedron);

    camera.position.z = 3;

    function animate() {
      requestAnimationFrame(animate);
      icosahedron.rotation.x += 0.01;
      icosahedron.rotation.y += 0.01;
      renderer.render(scene, camera);
    }

    animate();

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.2;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function subdivideFace(bufferGeometry, faceIndex) {
      const positionAttribute = bufferGeometry.getAttribute("position");
      const a = new THREE.Vector3().fromBufferAttribute(positionAttribute, faceIndex * 3);
      const b = new THREE.Vector3().fromBufferAttribute(positionAttribute, faceIndex * 3 + 1);
      const c = new THREE.Vector3().fromBufferAttribute(positionAttribute, faceIndex * 3 + 2);
    
      const ab = a.clone().add(b).normalize();
      const bc = b.clone().add(c).normalize();
      const ca = c.clone().add(a).normalize();
    
      const vertices = [
        a, ab, ca,
        b, bc, ab,
        c, ca, bc,
        ab, bc, ca
      ].flatMap(v => [v.x, v.y, v.z]);
    
      const newPositionsArray = Array.from(positionAttribute.array);
      newPositionsArray.splice(faceIndex * 3 * 3, 3 * 3, ...vertices);
      const newPositions = new Float32Array(newPositionsArray);
      bufferGeometry.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
    }

function onClick(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(icosahedron);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    subdivideFace(icosahedron.geometry, intersect.faceIndex);
  }
}

    window.addEventListener('click', onClick);

    return () =>{
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
  <div className="App">
  <header className="App-header">
  <canvas ref={canvasRef} />
  </header>
  </div>
  );
  }
  
  export default App;
