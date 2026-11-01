import React, { useState, useEffect } from 'react';
import { playClickSound } from '../utils/audio';

export default function PreloaderBoot({ onComplete, soundEnabled }) {
  const [percent, setPercent] = useState(0);
  const [statusLog, setStatusLog] = useState('INITIALIZING SCROLLBUS...');

  const logs = [
    'INITIALIZING SCROLLBUS...',
    'ALLOCATING FBO TEXTURES...',
    'COMPILING STAR-6 SHADER...',
    'CALIBRATING STICKER PHYSICS...',
    'MOUNTING RUST WEBASSEMBLY CORE...',
    'INITIALIZING INDIC RETRIEVAL MESH...',
    'READY'
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Non-linear progression
      if (current < 45) current += 3;
      else if (current < 70) current += 1;
      else if (current < 95) current += 4;
      else current = 100;

      setPercent(current);
      const logIdx = Math.min(Math.floor((current / 100) * logs.length), logs.length - 1);
      setStatusLog(logs[logIdx]);

      if (current >= 100) {
        clearInterval(interval);
        playClickSound(soundEnabled, 880);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 32);

    return () => clearInterval(interval);
  }, []);

  const totalBlocks = 16;
  const filledBlocks = Math.floor((percent / 100) * totalBlocks);
  const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0A0B] text-[#f2f2f2] font-mono flex flex-col items-center justify-center p-6 select-none">
      {/* CRT Scanline Texture */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[size:100%_4px] opacity-25" />

      <div className="w-full max-w-sm space-y-4 text-center z-10">
        <div className="text-[11px] text-white/50 tracking-widest uppercase">
          [ SYSTEM BOOTING: DHVANI_CORE_V2 ]
        </div>

        <div className="text-4xl font-bold text-[#C0FE04] tracking-tighter">
          {String(percent).padStart(2, '0')}%
        </div>

        <div className="text-sm font-bold text-white/90 tracking-wider">
          [{progressBar}]
        </div>

        <div className="text-[10px] text-white/40 tracking-wider h-4 uppercase">
          {statusLog}
        </div>
      </div>
    </div>
  );
}
