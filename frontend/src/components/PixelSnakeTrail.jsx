import React, { useEffect, useRef } from 'react';

export default function PixelSnakeTrail() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const pointsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 28 segments for smooth long pixel snake trail
    const length = 28;
    pointsRef.current = Array.from({ length }, () => ({
      x: mouseRef.current.x,
      y: mouseRef.current.y
    }));

    let animationId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;
      // Head follows cursor with fast responsive spring
      points[0].x += (mouseRef.current.x - points[0].x) * 0.45;
      points[0].y += (mouseRef.current.y - points[0].y) * 0.45;

      // Trailing segments follow with smooth progressive lag
      for (let i = 1; i < points.length; i++) {
        points[i].x += (points[i - 1].x - points[i].x) * 0.52;
        points[i].y += (points[i - 1].y - points[i].y) * 0.52;
      }

      // Draw subtle cursor spotlight on grid
      const grad = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        180
      );
      grad.addColorStop(0, 'rgba(192, 254, 4, 0.08)');
      grad.addColorStop(1, 'rgba(192, 254, 4, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 180, 0, Math.PI * 2);
      ctx.fill();

      // Draw green pixel squares
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const size = 9;
        const opacity = (1 - i / points.length) * 0.95;

        // Snapped to 9px retro grid
        const snappedX = Math.floor(p.x / size) * size;
        const snappedY = Math.floor(p.y / size) * size;

        ctx.fillStyle = i === 0 ? '#FFFFFF' : '#C0FE04';
        ctx.globalAlpha = opacity;
        ctx.shadowColor = '#C0FE04';
        ctx.shadowBlur = i < 6 ? 8 : 2;
        ctx.fillRect(snappedX - size / 2, snappedY - size / 2, size, size);
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 w-full h-full"
    />
  );
}
