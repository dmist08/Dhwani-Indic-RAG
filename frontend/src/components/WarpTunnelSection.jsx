import React, { useEffect, useRef } from 'react';

export default function WarpTunnelSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Generate 180 radial streak rays
    const rays = Array.from({ length: 180 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 2 + Math.random() * 6,
      dist: Math.random() * 600,
      len: 20 + Math.random() * 80,
      color: ['#00E5FF', '#FF0055', '#C0FE04', '#FFFFFF', '#7000FF'][Math.floor(Math.random() * 5)]
    }));

    let animationId;
    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      rays.forEach((r) => {
        r.dist += r.speed;
        if (r.dist > Math.max(canvas.width, canvas.height)) {
          r.dist = 10;
          r.angle = Math.random() * Math.PI * 2;
        }

        const x1 = cx + Math.cos(r.angle) * r.dist;
        const y1 = cy + Math.sin(r.angle) * r.dist;
        const x2 = cx + Math.cos(r.angle) * (r.dist + r.len);
        const y2 = cy + Math.sin(r.angle) * (r.dist + r.len);

        ctx.beginPath();
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.5;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="relative w-full min-h-[900px] flex flex-col items-center justify-center overflow-hidden bg-[#020617] text-white py-32 border-t border-white/10 select-none">
      
      {/* 3D Radial Warp Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Center 3D Concentric Rotating Rings */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-16 px-4">
        
        {/* Top Headline */}
        <div className="space-y-4">
          <div className="inline-block border-2 border-[#C0FE04] bg-black/60 px-6 py-3 rounded-2xl backdrop-blur-md">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tighter text-[#C0FE04]">
              INNOVATE WITH PURPOSE
            </h2>
          </div>
        </div>

        {/* Orbiting Concentric 3D Wireframe Rings with Manifesto Statements */}
        <div className="relative w-[340px] sm:w-[600px] h-[320px] flex items-center justify-center">
          
          {/* Ring 1 */}
          <div className="absolute inset-0 border border-[#C0FE04]/50 rounded-[50%] animate-spin [animation-duration:20s] flex items-center justify-between px-4">
            <span className="bg-black text-[11px] font-mono text-[#C0FE04] px-2 py-0.5 rounded border border-[#C0FE04]/30">
              Building tomorrow's digital products.
            </span>
            <span className="bg-black text-[11px] font-mono text-[#C0FE04] px-2 py-0.5 rounded border border-[#C0FE04]/30">
              Independent by design & engineering.
            </span>
          </div>

          {/* Ring 2 */}
          <div className="absolute inset-8 border border-[#00E5FF]/40 rounded-[50%] animate-spin [animation-duration:15s] [animation-direction:reverse] flex items-center justify-between px-4">
            <span className="bg-black text-[11px] font-mono text-[#00E5FF] px-2 py-0.5 rounded border border-[#00E5FF]/30">
              Clarity first, Delight second.
            </span>
            <span className="bg-black text-[11px] font-mono text-[#00E5FF] px-2 py-0.5 rounded border border-[#00E5FF]/30">
              Ship in small loops, Aim for long arcs.
            </span>
          </div>

          {/* Center Core */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C0FE04] to-[#00E5FF] shadow-[0_0_50px_#C0FE04] animate-pulse" />
        </div>

        {/* Bottom Headline */}
        <h3 className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white/90">
          FUTURE-FIRST ALWAYS
        </h3>
      </div>
    </section>
  );
}
