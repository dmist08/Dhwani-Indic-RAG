import React, { useState } from 'react';
import { playClickSound } from '../utils/audio';

export default function CaseStudyADrive({ soundEnabled, onClose }) {
  const [strokeWeight, setStrokeWeight] = useState(2.0);

  const sampleIcons = [
    { name: 'Cloud Sync', path: 'M12 4v16m-8-8h16' },
    { name: 'Folder Tree', path: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { name: 'Photo Grid', path: 'M4 4h16v16H4z M9 9h6v6H9z' },
    { name: 'Optical Star', path: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
      <div className="bg-[#0c101c] border border-[#1d3d8f] max-w-5xl w-full p-6 lg:p-10 rounded-3xl space-y-6 shadow-2xl relative text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#C0FE04] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C0FE04]" />
              <span>ALIBABA CLOUD // aDrive & SHORE DESIGN SYSTEM (2020-2022)</span>
            </div>
            <h3 className="font-sans font-bold text-2xl lg:text-3xl uppercase tracking-tight mt-1">
              Enterprise Cloud Storage Ecosystem Architecture
            </h3>
          </div>

          <button
            onClick={() => {
              playClickSound(soundEnabled, 500);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C0FE04] hover:text-black font-mono text-sm flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="font-sans text-sm text-white/80 leading-relaxed">
          The aDrive Design System (ADS) and Shore Icon Architecture created a unified, multi-platform token pipeline across Web, Electron Desktop, iOS, and Android for millions of enterprise users.
        </p>

        {/* Shore Optical Icon Tester */}
        <div className="p-6 bg-[#05070d] rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center font-mono text-xs">
            <span className="text-[#C0FE04] font-bold uppercase">Shore Icon Optical Stroke Adjuster:</span>
            <span className="text-white/60">{strokeWeight}px Stroke</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sampleIcons.map((icon, idx) => (
              <div 
                key={idx}
                onClick={() => playClickSound(soundEnabled, 900 + idx * 50)}
                className="p-4 bg-white/5 hover:bg-[#C0FE04]/10 border border-white/10 hover:border-[#C0FE04] rounded-xl flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all"
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C0FE04" strokeWidth={strokeWeight} strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon.path} />
                </svg>
                <span className="font-mono text-xs text-white/80">{icon.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-2 font-mono text-xs">
            <span>Stroke Weight:</span>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.5"
              value={strokeWeight}
              onChange={(e) => setStrokeWeight(Number(e.target.value))}
              className="flex-1 accent-[#C0FE04] cursor-pointer"
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center font-mono text-xs text-white/60">
          <span>Design Tokens: Multi-Platform Figma to Kotlin/Swift Pipeline</span>
          <span className="text-[#C0FE04]">Alibaba Cloud ADS Core</span>
        </div>
      </div>
    </div>
  );
}
