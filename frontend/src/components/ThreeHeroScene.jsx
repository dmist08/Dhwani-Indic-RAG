import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHeroScene({ mousePos }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x1a3377, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(5, 8, 10);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x3b82f6, 4, 30);
    fillLight.position.set(-6, -4, 6);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x60a5fa, 6, 25);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Group for 3D Inflatable Tube Lettering
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Glossy Inflatable Blue Vinyl / Plastic Material
    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8,
      emissive: 0x0a1e5c,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
      sheen: 0.5,
      sheenColor: 0x93c5fd
    });

    // Create 3D Inflatable Cursive Curves for "hello" / "dhvani"
    const curves = [];

    // Letter 'h'
    const hPath = new THREE.CurvePath();
    hPath.add(new THREE.LineCurve3(new THREE.Vector3(-4.8, 2.2, 0), new THREE.Vector3(-4.8, -1.8, 0)));
    hPath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-4.8, -0.2, 0),
      new THREE.Vector3(-4.2, 1.2, 0.4),
      new THREE.Vector3(-3.2, 1.2, 0.4),
      new THREE.Vector3(-3.2, -1.8, 0)
    ));
    curves.push(hPath);

    // Letter 'e'
    const ePath = new THREE.CurvePath();
    ePath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-2.6, -0.4, 0),
      new THREE.Vector3(-1.0, -0.4, 0.2),
      new THREE.Vector3(-1.0, 1.1, 0.3),
      new THREE.Vector3(-2.4, 0.8, 0.2)
    ));
    ePath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-2.4, 0.8, 0.2),
      new THREE.Vector3(-2.8, -0.4, 0.1),
      new THREE.Vector3(-1.8, -1.8, 0.2),
      new THREE.Vector3(-1.0, -1.5, 0.3)
    ));
    curves.push(ePath);

    // Letter 'l' (first)
    const l1Path = new THREE.CurvePath();
    l1Path.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.6, -1.8, 0.2),
      new THREE.Vector3(-0.4, 2.8, 0.4),
      new THREE.Vector3(0.5, 2.8, 0.4),
      new THREE.Vector3(0.4, -1.8, 0.2)
    ));
    curves.push(l1Path);

    // Letter 'l' (second)
    const l2Path = new THREE.CurvePath();
    l2Path.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.7, -1.8, 0.2),
      new THREE.Vector3(0.9, 2.8, 0.4),
      new THREE.Vector3(1.8, 2.8, 0.4),
      new THREE.Vector3(1.7, -1.8, 0.2)
    ));
    curves.push(l2Path);

    // Letter 'o'
    const oPath = new THREE.CurvePath();
    oPath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(2.3, 0.0, 0.2),
      new THREE.Vector3(2.3, 1.4, 0.4),
      new THREE.Vector3(4.2, 1.4, 0.4),
      new THREE.Vector3(4.2, 0.0, 0.2)
    ));
    oPath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(4.2, 0.0, 0.2),
      new THREE.Vector3(4.2, -1.8, 0.2),
      new THREE.Vector3(2.3, -1.8, 0.2),
      new THREE.Vector3(2.3, 0.0, 0.2)
    ));
    // Tail loop
    oPath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(4.0, 0.6, 0.3),
      new THREE.Vector3(5.2, 0.8, 0.5),
      new THREE.Vector3(5.5, -0.6, 0.4),
      new THREE.Vector3(4.8, -1.2, 0.2)
    ));
    curves.push(oPath);

    // Build Tube Geometries
    curves.forEach((path) => {
      const geometry = new THREE.TubeGeometry(path, 64, 0.52, 16, false);
      const mesh = new THREE.Mesh(geometry, tubeMaterial);
      mainGroup.add(mesh);
    });

    // Floating Stickers Group
    const stickerGroup = new THREE.Group();
    scene.add(stickerGroup);

    // 1. Glossy Gold / Bronze Coin Seal Badge ("DHVANI 2026")
    const coinGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.12, 32);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25
    });
    const coinMesh = new THREE.Mesh(coinGeo, coinMat);
    coinMesh.position.set(-6.2, 2.5, 1.2);
    coinMesh.rotation.set(0.3, 0.4, -0.2);
    stickerGroup.add(coinMesh);

    // 2. Holographic Pen Nib Sticker
    const penGeo = new THREE.ConeGeometry(0.55, 1.1, 4);
    const penMat = new THREE.MeshPhysicalMaterial({
      color: 0xf3f4f6,
      roughness: 0.1,
      metalness: 0.8,
      clearcoat: 1.0
    });
    const penMesh = new THREE.Mesh(penGeo, penMat);
    penMesh.position.set(-4.5, 1.5, 1.5);
    penMesh.rotation.set(0.2, 0, 0.8);
    stickerGroup.add(penMesh);

    // 3. Glossy Star Sticker (Yellow with Eyes)
    const starGeo = new THREE.DodecahedronGeometry(0.7, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.3,
      metalness: 0.1
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.position.set(-1.6, 2.8, 1.5);
    starMesh.rotation.set(0.4, 0.2, 0.1);
    stickerGroup.add(starMesh);

    // 4. Glossy Pink / Red Puffy Heart
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, 0.5, -0.6, 1.0, -1.0, 1.0);
    heartShape.bezierCurveTo(-1.6, 1.0, -1.6, 0.2, -1.6, 0.2);
    heartShape.bezierCurveTo(-1.6, -0.4, -0.8, -1.0, 0, -1.6);
    heartShape.bezierCurveTo(0.8, -1.0, 1.6, -0.4, 1.6, 0.2);
    heartShape.bezierCurveTo(1.6, 0.2, 1.6, 1.0, 1.0, 1.0);
    heartShape.bezierCurveTo(0.6, 1.0, 0, 0.5, 0, 0);

    const extrudeSettings = { depth: 0.35, bevelEnabled: true, bevelSegments: 6, steps: 2, bevelSize: 0.2, bevelThickness: 0.2 };
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      emissive: 0x881337,
      roughness: 0.15,
      clearcoat: 1.0
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.scale.set(0.5, 0.5, 0.5);
    heartMesh.position.set(-0.2, 2.6, 1.3);
    heartMesh.rotation.set(0.2, 0.3, 0.2);
    stickerGroup.add(heartMesh);

    // 5. 3D Floating Blue Cursor Arrow
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0);
    arrowShape.lineTo(0.9, -1.6);
    arrowShape.lineTo(0.3, -1.5);
    arrowShape.lineTo(0, -2.4);
    arrowShape.lineTo(-0.3, -1.5);
    arrowShape.lineTo(-0.9, -1.6);
    arrowShape.closePath();

    const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08 });
    const arrowMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      roughness: 0.15,
      clearcoat: 1.0
    });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowMesh.position.set(6.2, -1.8, 1.5);
    arrowMesh.rotation.set(0.2, -0.4, 0.5);
    stickerGroup.add(arrowMesh);

    // 6. 3D Floating Wireframe Globe in Bottom Right
    const globeGeo = new THREE.SphereGeometry(1.0, 16, 12);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeMesh.position.set(6.8, -3.8, 0.5);
    scene.add(globeMesh);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Mouse influence
      const targetX = (mousePos.x / window.innerWidth - 0.5) * 0.8;
      const targetY = -(mousePos.y / window.innerHeight - 0.5) * 0.8;

      mainGroup.rotation.y += (targetX - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetY - mainGroup.rotation.x) * 0.05;

      // Gentle floating buoyancy for stickers
      coinMesh.position.y = 2.5 + Math.sin(time * 1.5) * 0.12;
      coinMesh.rotation.y = 0.4 + Math.sin(time * 0.8) * 0.2;

      penMesh.position.y = 1.5 + Math.sin(time * 1.8 + 1) * 0.15;
      starMesh.position.y = 2.8 + Math.sin(time * 1.4 + 2) * 0.14;
      heartMesh.position.y = 2.6 + Math.sin(time * 1.6 + 3) * 0.13;
      arrowMesh.position.y = -1.8 + Math.sin(time * 2.0 + 4) * 0.18;
      arrowMesh.rotation.z = 0.5 + Math.sin(time * 1.2) * 0.15;

      globeMesh.rotation.y = time * 0.3;
      globeMesh.rotation.x = time * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
}
