import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import DraggableSticker from './DraggableSticker';

export default function FooterInflatableScene({ mousePos, soundEnabled, coords }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 700;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 13);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x1e3a8a, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
    keyLight.position.set(6, 8, 10);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x60a5fa, 8, 25);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    // Glossy Royal Blue Inflatable Material
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.9,
      transmission: 0.35,
      thickness: 1.2
    });

    const group = new THREE.Group();
    scene.add(group);

    // Build 3D Tube Geometry for "CRAFT" and "TASTE"
    const paths = [];

    // 'C'
    const cCurve = new THREE.CurvePath();
    cCurve.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-4.5, 2.2, 0),
      new THREE.Vector3(-6.2, 2.2, 0.2),
      new THREE.Vector3(-6.2, 0.2, 0.2),
      new THREE.Vector3(-4.5, 0.2, 0)
    ));
    paths.push(cCurve);

    // 'R'
    const rCurve = new THREE.CurvePath();
    rCurve.add(new THREE.LineCurve3(new THREE.Vector3(-3.8, 0.2, 0), new THREE.Vector3(-3.8, 2.2, 0)));
    rCurve.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-3.8, 2.2, 0),
      new THREE.Vector3(-2.2, 2.2, 0.2),
      new THREE.Vector3(-2.2, 1.2, 0.2),
      new THREE.Vector3(-3.8, 1.2, 0)
    ));
    rCurve.add(new THREE.LineCurve3(new THREE.Vector3(-3.0, 1.2, 0.1), new THREE.Vector3(-2.2, 0.2, 0.2)));
    paths.push(rCurve);

    // 'A'
    const aCurve = new THREE.CurvePath();
    aCurve.add(new THREE.LineCurve3(new THREE.Vector3(-1.8, 0.2, 0), new THREE.Vector3(-0.9, 2.2, 0.2)));
    aCurve.add(new THREE.LineCurve3(new THREE.Vector3(-0.9, 2.2, 0.2), new THREE.Vector3(0.0, 0.2, 0)));
    aCurve.add(new THREE.LineCurve3(new THREE.Vector3(-1.4, 0.9, 0.1), new THREE.Vector3(-0.4, 0.9, 0.1)));
    paths.push(aCurve);

    // 'F'
    const fCurve = new THREE.CurvePath();
    fCurve.add(new THREE.LineCurve3(new THREE.Vector3(0.8, 0.2, 0), new THREE.Vector3(0.8, 2.2, 0)));
    fCurve.add(new THREE.LineCurve3(new THREE.Vector3(0.8, 2.2, 0), new THREE.Vector3(2.2, 2.2, 0.1)));
    fCurve.add(new THREE.LineCurve3(new THREE.Vector3(0.8, 1.3, 0), new THREE.Vector3(1.8, 1.3, 0.1)));
    paths.push(fCurve);

    // 'T' (first)
    const t1Curve = new THREE.CurvePath();
    t1Curve.add(new THREE.LineCurve3(new THREE.Vector3(3.6, 0.2, 0), new THREE.Vector3(3.6, 2.2, 0)));
    t1Curve.add(new THREE.LineCurve3(new THREE.Vector3(2.6, 2.2, 0.1), new THREE.Vector3(4.6, 2.2, 0.1)));
    paths.push(t1Curve);

    // 'T' 'A' 'S' 'T' 'E' (Bottom Line: y ~ -1.8)
    const t2Curve = new THREE.CurvePath();
    t2Curve.add(new THREE.LineCurve3(new THREE.Vector3(-4.5, -2.4, 0), new THREE.Vector3(-4.5, -0.4, 0)));
    t2Curve.add(new THREE.LineCurve3(new THREE.Vector3(-5.5, -0.4, 0.1), new THREE.Vector3(-3.5, -0.4, 0.1)));
    paths.push(t2Curve);

    const a2Curve = new THREE.CurvePath();
    a2Curve.add(new THREE.LineCurve3(new THREE.Vector3(-2.8, -2.4, 0), new THREE.Vector3(-1.9, -0.4, 0.2)));
    a2Curve.add(new THREE.LineCurve3(new THREE.Vector3(-1.9, -0.4, 0.2), new THREE.Vector3(-1.0, -2.4, 0)));
    a2Curve.add(new THREE.LineCurve3(new THREE.Vector3(-2.4, -1.6, 0.1), new THREE.Vector3(-1.4, -1.6, 0.1)));
    paths.push(a2Curve);

    const sCurve = new THREE.CurvePath();
    sCurve.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.8, -0.4, 0),
      new THREE.Vector3(-0.6, -0.4, 0.2),
      new THREE.Vector3(0.8, -1.4, 0.2),
      new THREE.Vector3(-0.6, -2.4, 0)
    ));
    paths.push(sCurve);

    const t3Curve = new THREE.CurvePath();
    t3Curve.add(new THREE.LineCurve3(new THREE.Vector3(1.8, -2.4, 0), new THREE.Vector3(1.8, -0.4, 0)));
    t3Curve.add(new THREE.LineCurve3(new THREE.Vector3(0.9, -0.4, 0.1), new THREE.Vector3(2.7, -0.4, 0.1)));
    paths.push(t3Curve);

    const eCurve = new THREE.CurvePath();
    eCurve.add(new THREE.LineCurve3(new THREE.Vector3(3.5, -2.4, 0), new THREE.Vector3(3.5, -0.4, 0)));
    eCurve.add(new THREE.LineCurve3(new THREE.Vector3(3.5, -0.4, 0), new THREE.Vector3(4.8, -0.4, 0.1)));
    eCurve.add(new THREE.LineCurve3(new THREE.Vector3(3.5, -1.4, 0), new THREE.Vector3(4.5, -1.4, 0.1)));
    eCurve.add(new THREE.LineCurve3(new THREE.Vector3(3.5, -2.4, 0), new THREE.Vector3(4.8, -2.4, 0.1)));
    paths.push(eCurve);

    paths.forEach((p) => {
      const geo = new THREE.TubeGeometry(p, 48, 0.45, 16, false);
      const mesh = new THREE.Mesh(geo, material);
      group.add(mesh);
    });

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const targetX = (mousePos.x / window.innerWidth - 0.5) * 0.7;
      const targetY = -(mousePos.y / window.innerHeight - 0.5) * 0.7;

      group.rotation.y += (targetX - group.rotation.y) * 0.05;
      group.rotation.x += (targetY - group.rotation.x) * 0.05;

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
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, []);

  return (
    <footer id="contact" className="relative w-full min-h-[850px] bg-[#020b24] text-white flex flex-col justify-between px-4 lg:px-14 pt-24 pb-12 overflow-hidden border-t border-white/10 select-none">
      
      {/* 3D Inflatable WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />

      {/* Bold White Overlay Typography */}
      <div className="relative z-20 space-y-3 pointer-events-none">
        <h2 className="text-[9vw] lg:text-[7.5vw] font-bold uppercase leading-[0.88] tracking-tighter drop-shadow-2xl">
          LET'S CREATE<br />
          SOMETHING<br />
          EXTRAORDINARY
        </h2>
      </div>

      {/* Draggable Floating Stickers over Footer */}
      <div className="absolute inset-0 pointer-events-auto z-30">
        
        {/* Reunimos Stamp */}
        <DraggableSticker initialX={window.innerWidth * 0.65} initialY={120} initialRotate={-12} soundEnabled={soundEnabled}>
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#d4af37] bg-[#1e1b18]/90 text-[#d4af37] flex flex-col items-center justify-center font-mono text-[9px] uppercase shadow-2xl backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer">
            <span className="font-bold">REUNIMOS</span>
            <span>2026</span>
          </div>
        </DraggableSticker>

        {/* Yellow Star */}
        <DraggableSticker initialX={window.innerWidth * 0.12} initialY={460} initialRotate={15} soundEnabled={soundEnabled}>
          <div className="text-5xl hover:scale-125 transition-transform drop-shadow-xl cursor-pointer">
            ⭐
          </div>
        </DraggableSticker>

        {/* Pink Heart */}
        <DraggableSticker initialX={window.innerWidth * 0.22} initialY={60} initialRotate={-8} soundEnabled={soundEnabled}>
          <div className="text-5xl hover:scale-125 transition-transform drop-shadow-xl cursor-pointer">
            💖
          </div>
        </DraggableSticker>

        {/* Blue Cursor Arrow */}
        <DraggableSticker initialX={window.innerWidth * 0.45} initialY={400} initialRotate={45} soundEnabled={soundEnabled}>
          <div className="w-12 h-12 bg-blue-500 rounded-lg shadow-xl flex items-center justify-center text-white text-xl font-bold cursor-pointer hover:scale-110 transition-transform">
            ➤
          </div>
        </DraggableSticker>

        {/* 2026 Badge */}
        <DraggableSticker initialX={window.innerWidth * 0.38} initialY={560} initialRotate={-10} soundEnabled={soundEnabled}>
          <div className="font-mono font-extrabold text-sm px-3 py-1 bg-rose-500 text-white rounded border border-white shadow-xl hover:scale-110 transition-transform cursor-pointer">
            2026
          </div>
        </DraggableSticker>

        {/* Smiley */}
        <DraggableSticker initialX={window.innerWidth * 0.78} initialY={480} initialRotate={18} soundEnabled={soundEnabled}>
          <div className="w-16 h-16 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-3xl shadow-xl hover:scale-110 transition-transform cursor-pointer">
            😊
          </div>
        </DraggableSticker>

      </div>

      {/* Bottom Status Bar matching video */}
      <div className="relative z-20 pt-16 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-xs uppercase opacity-80 pointer-events-auto">
        <a href="https://github.com/dmist08/Dhwani-Indic-RAG" target="_blank" rel="noreferrer" className="hover:text-[#C0FE04] transition-colors">
          GITHUB: @DMIST08
        </a>

        <span>DHARMIK MISTRY (C) 2026</span>

        <span className="hidden md:inline">{coords.x} X {coords.y} Y</span>

        <div className="flex gap-6">
          <a href="https://github.com/dmist08/Dhwani-Indic-RAG" target="_blank" rel="noreferrer" className="hover:text-[#C0FE04] transition-colors">
            DHVANI INDIC RAG
          </a>
          <a href="https://github.com/dmist08" target="_blank" rel="noreferrer" className="hover:text-[#C0FE04] transition-colors">
            GITHUB PROFILE
          </a>
        </div>
      </div>
    </footer>
  );
}
