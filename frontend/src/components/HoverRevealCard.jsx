import React, { useState, useRef } from 'react';
import { playClickSound } from '../utils/audio';

export default function HoverRevealCard({ 
  project, 
  index, 
  soundEnabled = false, 
  onClick,
  colSpanClass = "col-span-12 lg:col-span-6",
  theme = "blue"
}) {
  const [mouseOffset, setMouseOffset] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMouseOffset({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playClickSound(soundEnabled, 800);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const cardBaseBg =
    theme === 'blue'
      ? 'bg-[#05143d]/90 border-[#1d3d8f]'
      : theme === 'dark'
      ? 'bg-[#141414] border-[#2a2a2a]'
      : 'bg-white border-[#e4e4e7]';

  return (
    <article className={colSpanClass}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className="group block space-y-3 cursor-pointer select-none"
      >
        {/* Aspect-Square Tile with Circular Reveal Mask */}
        <div className={`relative w-full aspect-square ${cardBaseBg} border rounded-2xl overflow-hidden p-8 flex flex-col justify-between shadow-xl transition-all duration-300 group-hover:border-[#C0FE04]`}>
          
          {/* Hover-Reveal Mask Layer */}
          <div
            style={{
              clipPath: isHovered
                ? `circle(120% at ${mouseOffset.x}% ${mouseOffset.y}%)`
                : `circle(0% at ${mouseOffset.x}% ${mouseOffset.y}%)`,
              transition: 'clip-path 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
            className="absolute inset-0 bg-gradient-to-tr from-[#1d4ed8]/40 via-[#3b82f6]/20 to-[#C0FE04]/20 pointer-events-none z-10 backdrop-blur-[2px]"
          />

          {/* Top Tag Badge */}
          <div className="flex justify-between items-center z-20">
            <span className="font-mono text-xs text-[#C0FE04] font-bold">
              0{index + 1}
            </span>
            <span className="bg-[#C0FE04] text-black font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">
              {project.tag}
            </span>
          </div>

          {/* Center Visual Wave Preview */}
          <div className="space-y-2 z-20">
            <h4 className="font-sans font-bold text-xl lg:text-2xl uppercase tracking-tight group-hover:text-[#C0FE04] transition-colors leading-tight">
              {project.title}
            </h4>
            <p className="font-sans text-xs opacity-75 line-clamp-3 leading-relaxed">
              {project.desc}
            </p>
          </div>

          {/* Bottom Metagroup */}
          <div className="pt-4 border-t border-white/10 font-mono text-xs flex items-center justify-between z-20">
            <span className="text-[#C0FE04] font-semibold">{project.stats}</span>
            <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform font-mono text-sm">
              ↗
            </span>
          </div>
        </div>

        {/* Bottom Label Line */}
        <div className="flex justify-between items-center text-xs uppercase font-mono px-1">
          <span className="font-bold truncate opacity-90">{project.title}</span>
          <span className="opacity-60">{project.year}</span>
        </div>
      </div>
    </article>
  );
}
