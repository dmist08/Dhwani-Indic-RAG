import React from 'react';
import { playClickSound } from '../utils/audio';

export default function TelemetryHUD({ onClose, soundEnabled }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[80] bg-[#05070d]/95 border-b-2 border-[#C0FE04] text-[#C0FE04] font-mono text-xs p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300">
      <div className="max-w-6xl mx-auto space-y-4">
        
        <div className="flex justify-between items-center border-b border-[#C0FE04]/30 pb-2">
          <span className="font-bold tracking-widest uppercase">
            [ SYSTEM_TELEMETRY // LIVE RUNTIME METRICS ]
          </span>
          <button
            onClick={() => {
              playClickSound(soundEnabled, 450);
              onClose();
            }}
            className="px-2 py-0.5 bg-[#C0FE04] text-black font-bold uppercase rounded hover:bg-white transition-colors cursor-pointer"
          >
            Close HUD [ESC]
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-1">
          <div className="space-y-1 bg-black/50 p-3 rounded-lg border border-[#C0FE04]/20">
            <span className="text-white/50 text-[10px] uppercase block">Rendering Engine</span>
            <span className="font-bold text-white">Three.js R3F + FBO</span>
          </div>

          <div className="space-y-1 bg-black/50 p-3 rounded-lg border border-[#C0FE04]/20">
            <span className="text-white/50 text-[10px] uppercase block">Active Glass Shader</span>
            <span className="font-bold text-[#C0FE04]">STAR6_REFRACT_V2</span>
          </div>

          <div className="space-y-1 bg-black/50 p-3 rounded-lg border border-[#C0FE04]/20">
            <span className="text-white/50 text-[10px] uppercase block">Scroll Synchronization</span>
            <span className="font-bold text-white">Lenis ScrollBus (0ms lag)</span>
          </div>

          <div className="space-y-1 bg-black/50 p-3 rounded-lg border border-[#C0FE04]/20">
            <span className="text-white/50 text-[10px] uppercase block">Color Space Gamut</span>
            <span className="font-bold text-white">OKLCH P3 Compliant</span>
          </div>

          <div className="space-y-1 bg-black/50 p-3 rounded-lg border border-[#C0FE04]/20">
            <span className="text-white/50 text-[10px] uppercase block">Coordinates</span>
            <span className="font-bold text-white">30.27° N, 120.15° E</span>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-white/60 flex justify-between">
          <span>Target Architecture: WASM Embedded ESM + Web Audio API Oscillators</span>
          <span>Status: 120 FPS STABLE</span>
        </div>
      </div>
    </div>
  );
}
