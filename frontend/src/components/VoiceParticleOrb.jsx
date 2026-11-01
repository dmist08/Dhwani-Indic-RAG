import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function VoiceParticleOrb({ isRecording, isLoading, onToggleRecord, language }) {
  const containerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    const particleCount = 2600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const r = 1.65;
      const x = Math.cos(theta) * radiusAtY * r;
      const z = Math.sin(theta) * radiusAtY * r;
      const py = y * r;

      positions[i * 3] = x;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = py;
      originalPositions[i * 3 + 2] = z;

      const mixRatio = (py + 1.65) / 3.3;
      colors[i * 3] = 0.05 + mixRatio * 0.45;
      colors[i * 3 + 1] = 0.95 - mixRatio * 0.40;
      colors[i * 3 + 2] = 0.99;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 32;
    canvasTexture.height = 32;
    const ctx = canvasTexture.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(0, 242, 254, 0.85)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvasTexture);

    const material = new THREE.PointsMaterial({
      size: 0.088,
      map: texture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const coreGeo = new THREE.SphereGeometry(0.85, 20, 20);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.05,
      wireframe: true
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      let audioFactor = 0.0;
      if (isRecording && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const sum = dataArrayRef.current.reduce((acc, v) => acc + v, 0);
        audioFactor = (sum / dataArrayRef.current.length) / 128.0;
      }

      const rotSpeed = isLoading ? 2.6 : isRecording ? 1.5 : 0.45;
      particles.rotation.y = time * rotSpeed * 0.3;
      particles.rotation.x = Math.sin(time * 0.25) * 0.15;
      core.rotation.y = -time * rotSpeed * 0.2;

      const posAttr = geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];
        let displacement = 0;
        if (isLoading) {
          displacement = Math.sin(time * 7 + oy * 4) * 0.28;
        } else if (isRecording) {
          const freqWave = Math.sin(time * 14 + ox * 5) * Math.cos(time * 11 + oz * 5);
          displacement = (freqWave * 0.32 + audioFactor * 0.7);
        } else {
          displacement = Math.sin(time * 1.6 + ox * 2 + oy * 2) * 0.07;
        }
        const scale = 1 + displacement;
        posAttr.array[i * 3] = ox * scale;
        posAttr.array[i * 3 + 1] = oy * scale;
        posAttr.array[i * 3 + 2] = oz * scale;
      }
      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
    };
  }, [isRecording, isLoading]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center my-3">
      <div 
        ref={containerRef} 
        onClick={onToggleRecord} 
        className="w-72 h-72 cursor-pointer relative flex items-center justify-center group"
      >
        <div className={`absolute inset-6 rounded-full transition-all duration-700 pointer-events-none blur-3xl ${
          isRecording 
            ? 'bg-rose-500/30 scale-125' 
            : isLoading 
            ? 'bg-indigo-500/35 scale-110 animate-pulse' 
            : 'bg-cyan-500/18 group-hover:bg-cyan-500/30 group-hover:scale-105'
        }`} />
      </div>
      <button 
        onClick={onToggleRecord} 
        className="mt-1 px-5 py-2 rounded-full border border-slate-800 bg-[#0c101c]/90 backdrop-blur-md flex items-center gap-3 hover:border-cyan-500/60 transition-all shadow-xl group"
      >
        <span className={`w-2.5 h-2.5 rounded-full transition-all ${
          isRecording 
            ? 'bg-rose-500 animate-ping' 
            : isLoading 
            ? 'bg-indigo-400 animate-pulse' 
            : 'bg-cyan-400 group-hover:shadow-[0_0_8px_#00f2fe]'
        }`} />
        <span className="text-xs font-mono tracking-wider uppercase text-slate-300 group-hover:text-white">
          {isRecording ? 'LISTENING TO VOICE...' : isLoading ? 'SYNTHESIZING...' : `CLICK ORB TO SPEAK (${language.toUpperCase()})`}
        </span>
      </button>
    </div>
  );
}
