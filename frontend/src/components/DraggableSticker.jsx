import React, { useState, useRef, useEffect } from 'react';
import { playClickSound } from '../utils/audio';

export default function DraggableSticker({ 
  initialX = 100, 
  initialY = 100, 
  initialRotate = 0, 
  children, 
  soundEnabled = false,
  className = "" 
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [rotate, setRotate] = useState(initialRotate);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
    playClickSound(soundEnabled, 900);
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;
      setPos({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        playClickSound(soundEnabled, 650);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, soundEnabled]);

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: `rotate(${rotate}deg) scale(${isDragging ? 1.15 : 1})`,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        zIndex: isDragging ? 50 : 25
      }}
      className={`select-none transition-transform duration-100 ${className}`}
    >
      {children}
    </div>
  );
}
