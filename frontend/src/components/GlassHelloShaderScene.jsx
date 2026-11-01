import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GlassHelloShaderScene({ mousePos, theme = 'blue' }) {
  const mountRef = useRef(null);
  const internalMouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, vx: 0, vy: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 13.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.replaceChildren(renderer.domElement);

    // Studio Environment Lighting
    const ambientLight = new THREE.AmbientLight(theme === 'light' ? 0xffffff : 0x1e3a8a, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
    keyLight.position.set(6, 9, 12);
    scene.add(keyLight);

    const rimLight1 = new THREE.PointLight(0x60a5fa, 8, 30);
    rimLight1.position.set(-8, 5, -2);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0x38bdf8, 6, 25);
    rimLight2.position.set(8, -4, 6);
    scene.add(rimLight2);

    const topSpecularLight = new THREE.PointLight(0xffffff, 5, 20);
    topSpecularLight.position.set(0, 8, 8);
    scene.add(topSpecularLight);

    // High-refraction Glass Material
    const glassColor = theme === 'blue' ? 0x1d4ed8 : theme === 'dark' ? 0x2563eb : 0x3b82f6;
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: glassColor,
      transmission: 0.95,
      opacity: 1.0,
      transparent: true,
      roughness: 0.04,
      ior: 1.54,
      thickness: 2.2,
      attenuationColor: new THREE.Color(0x1e40af),
      attenuationDistance: 1.0,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.98,
      sheen: 0.8,
      sheenRoughness: 0.1,
      sheenColor: new THREE.Color(0x93c5fd)
    });

    // Main Group for "hello"
    const helloGroup = new THREE.Group();
    scene.add(helloGroup);

    const curves = [];

    // 'h'
    const h1 = new THREE.CurvePath();
    h1.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-4.8, 2.6, 0.4),
      new THREE.Vector3(-4.8, 1.0, 0.2),
      new THREE.Vector3(-4.8, -1.0, 0.2),
      new THREE.Vector3(-4.8, -2.0, 0.1)
    ));
    h1.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-4.8, -0.4, 0.1),
      new THREE.Vector3(-4.3, 1.4, 0.5),
      new THREE.Vector3(-3.2, 1.4, 0.5),
      new THREE.Vector3(-3.2, -2.0, 0.2)
    ));
    curves.push(h1);

    // 'e'
    const ePath = new THREE.CurvePath();
    ePath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-2.6, -0.6, 0.1),
      new THREE.Vector3(-0.9, -0.6, 0.3),
      new THREE.Vector3(-0.9, 1.2, 0.4),
      new THREE.Vector3(-2.4, 0.9, 0.3)
    ));
    ePath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-2.4, 0.9, 0.3),
      new THREE.Vector3(-2.9, -0.6, 0.2),
      new THREE.Vector3(-1.8, -2.0, 0.3),
      new THREE.Vector3(-0.9, -1.7, 0.4)
    ));
    curves.push(ePath);

    // 'l' (first)
    const l1Path = new THREE.CurvePath();
    l1Path.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.6, -2.0, 0.2),
      new THREE.Vector3(-0.4, 3.2, 0.6),
      new THREE.Vector3(0.5, 3.2, 0.6),
      new THREE.Vector3(0.4, -2.0, 0.3)
    ));
    curves.push(l1Path);

    // 'l' (second)
    const l2Path = new THREE.CurvePath();
    l2Path.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.7, -2.0, 0.3),
      new THREE.Vector3(0.9, 3.2, 0.6),
      new THREE.Vector3(1.8, 3.2, 0.6),
      new THREE.Vector3(1.7, -2.0, 0.3)
    ));
    curves.push(l2Path);

    // 'o'
    const oPath = new THREE.CurvePath();
    oPath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(2.3, -0.2, 0.2),
      new THREE.Vector3(2.3, 1.5, 0.5),
      new THREE.Vector3(4.3, 1.5, 0.5),
      new THREE.Vector3(4.3, -0.2, 0.3)
    ));
    oPath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(4.3, -0.2, 0.3),
      new THREE.Vector3(4.3, -2.0, 0.3),
      new THREE.Vector3(2.3, -2.0, 0.2),
      new THREE.Vector3(2.3, -0.2, 0.2)
    ));
    oPath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(4.1, 0.8, 0.4),
      new THREE.Vector3(5.3, 1.0, 0.6),
      new THREE.Vector3(5.6, -0.7, 0.5),
      new THREE.Vector3(4.8, -1.4, 0.3)
    ));
    curves.push(oPath);

    const tubeMeshes = [];
    curves.forEach((path) => {
      const geometry = new THREE.TubeGeometry(path, 80, 0.58, 24, false);
      const mesh = new THREE.Mesh(geometry, glassMaterial);
      helloGroup.add(mesh);
      tubeMeshes.push(mesh);
    });

    // Star-6 Specular Lens Glints
    const createStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.translate(64, 64);

      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath();
        ctx.ellipse(0, 0, 52, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.4, 'rgba(192, 254, 4, 0.8)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(canvas);
    };

    const starTexture = createStarTexture();
    const flareMaterial = new THREE.SpriteMaterial({
      map: starTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95
    });

    const flares = [
      { x: -3.8, y: 1.5, z: 1.0, scale: 1.2, speed: 2.0 },
      { x: -0.1, y: 3.1, z: 1.1, scale: 1.5, speed: 2.5 },
      { x: 1.3, y: 3.1, z: 1.1, scale: 1.4, speed: 2.2 },
      { x: 3.6, y: 1.5, z: 1.0, scale: 1.3, speed: 2.8 },
      { x: -2.0, y: -0.5, z: 0.8, scale: 1.0, speed: 1.8 }
    ].map((f) => {
      const sprite = new THREE.Sprite(flareMaterial);
      sprite.position.set(f.x, f.y, f.z);
      sprite.scale.set(f.scale, f.scale, 1);
      helloGroup.add(sprite);
      return { sprite, ...f };
    });

    // 3D Particles & Stickers Behind and Around Glass
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);

    const particles = [];
    const colors = [0xfde047, 0xf43f5e, 0x38bdf8, 0xc0fe04, 0xa855f7, 0xffffff];

    for (let i = 0; i < 20; i++) {
      const geo = i % 2 === 0 
        ? new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.25, 0)
        : new THREE.TorusGeometry(0.3, 0.12, 12, 24);
      
      const mat = new THREE.MeshPhysicalMaterial({
        color: colors[i % colors.length],
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
      });
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 9,
        -0.8 - Math.random() * 2.5
      );

      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      particlesGroup.add(mesh);

      particles.push({
        mesh,
        baseX: mesh.position.x,
        baseY: mesh.position.y,
        vy: -0.012 - Math.random() * 0.015,
        vx: (Math.random() - 0.5) * 0.01,
        rotSpeedX: (Math.random() - 0.5) * 0.03,
        rotSpeedY: (Math.random() - 0.5) * 0.03
      });
    }

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth Elastic Mouse Follow with Velocity
      const targetNormX = (mousePos.x / window.innerWidth - 0.5) * 2;
      const targetNormY = -(mousePos.y / window.innerHeight - 0.5) * 2;

      internalMouse.current.vx += (targetNormX - internalMouse.current.x) * 0.08;
      internalMouse.current.vy += (targetNormY - internalMouse.current.y) * 0.08;
      internalMouse.current.vx *= 0.85;
      internalMouse.current.vy *= 0.85;
      internalMouse.current.x += internalMouse.current.vx;
      internalMouse.current.y += internalMouse.current.vy;

      // 3D Parallax Tilt with Inflatable Jiggle
      const wobble = Math.sin(time * 3.5) * 0.03;
      helloGroup.rotation.y = internalMouse.current.x * 0.45 + wobble;
      helloGroup.rotation.x = -internalMouse.current.y * 0.35 + wobble * 0.5;
      helloGroup.position.z = Math.sin(time * 2.0) * 0.2;

      // Dynamic light movement
      topSpecularLight.position.x = internalMouse.current.x * 6;
      topSpecularLight.position.y = 8 + internalMouse.current.y * 4;

      // Star-6 Flare Rotation & Pulse
      flares.forEach((f) => {
        const pulse = 0.8 + Math.sin(time * f.speed + f.x) * 0.4;
        f.sprite.scale.set(f.scale * pulse, f.scale * pulse, 1);
        f.sprite.material.rotation = time * 0.4 + f.x;
      });

      // Interactive Particle Physics (Floating + Mouse Repulsion)
      const mouse3DX = internalMouse.current.x * 7;
      const mouse3DY = internalMouse.current.y * 4;

      particles.forEach((p) => {
        p.mesh.position.y += p.vy;
        p.mesh.position.x += p.vx;
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;

        // Mouse Repulsion Force
        const dx = p.mesh.position.x - mouse3DX;
        const dy = p.mesh.position.y - mouse3DY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3.5) {
          const force = (1 - dist / 3.5) * 0.15;
          p.mesh.position.x += (dx / dist) * force;
          p.mesh.position.y += (dy / dist) * force;
        }

        // Loop boundaries
        if (p.mesh.position.y < -6.0) {
          p.mesh.position.y = 6.0;
          p.mesh.position.x = (Math.random() - 0.5) * 16;
        }
      });

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
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
}
