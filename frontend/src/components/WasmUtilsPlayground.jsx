import React, { useState } from 'react';
import { playClickSound } from '../utils/audio';

export default function WasmUtilsPlayground({ soundEnabled, onClose }) {
  const [activeTab, setActiveTab] = useState('color'); // 'color', 'extract-colors', 'squircle'

  // Module 1: Color state
  const [lightness, setLightness] = useState(0.85);
  const [chroma, setChroma] = useState(0.18);
  const [hue, setHue] = useState(135);

  // Module 2: Extracted Palette state
  const [extractedPalette, setExtractedPalette] = useState([
    { name: 'Dominant Light', hex: '#C0FE04', oklch: 'oklch(92% 0.22 135)' },
    { name: 'Secondary Accent', hex: '#38BDF8', oklch: 'oklch(75% 0.18 220)' },
    { name: 'Deep Cyber Base', hex: '#05143D', oklch: 'oklch(18% 0.08 260)' },
    { name: 'Warm Lithograph', hex: '#F43F5E', oklch: 'oklch(62% 0.24 15)' },
    { name: 'Obsidian Obsidian', hex: '#0A0A0B', oklch: 'oklch(10% 0.01 260)' }
  ]);

  // Module 3: Squircle state
  const [squircleWidth, setSquircleWidth] = useState(200);
  const [squircleHeight, setSquircleHeight] = useState(200);
  const [squircleRadius, setSquircleRadius] = useState(48);
  const [squircleSmoothness, setSquircleSmoothness] = useState(0.85);
  const [copied, setCopied] = useState(false);

  // Simple OKLCH to CSS string
  const currentOklch = `oklch(${(lightness * 100).toFixed(1)}% ${chroma.toFixed(3)} ${hue}deg)`;
  const isOutOfGamut = chroma > 0.25;

  const copyString = (str) => {
    playClickSound(soundEnabled, 1000);
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Squircle Path
  const w = squircleWidth;
  const h = squircleHeight;
  const r = (squircleRadius / 100) * (Math.min(w, h) / 2);
  const s = squircleSmoothness;
  const squirclePath = `M ${w/2} 0 C ${w - r * (1 - s)} 0 ${w} ${r * (1 - s)} ${w} ${h/2} C ${w} ${h - r * (1 - s)} ${w - r * (1 - s)} ${h} ${w/2} ${h} C ${r * (1 - s)} ${h} 0 ${h - r * (1 - s)} 0 ${h/2} C 0 ${r * (1 - s)} ${r * (1 - s)} 0 ${w/2} 0 Z`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
      <div className="bg-[#0c101c] border border-[#1d3d8f] max-w-5xl w-full p-6 lg:p-10 rounded-3xl space-y-6 shadow-2xl relative text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#C0FE04] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C0FE04]" />
              <span>@WENHAOQI/WASM_DESIGN_UTILS // RUST + C TO WASM ESM (2025)</span>
            </div>
            <h3 className="font-sans font-bold text-2xl lg:text-3xl uppercase tracking-tight mt-1">
              High-Performance Browser Design Algorithms
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

        {/* Tab Switcher */}
        <div className="flex bg-[#05070d] p-1 rounded-xl border border-white/10 font-mono text-xs max-w-md">
          {[
            { id: 'color', label: '1. /color (OKLCH)' },
            { id: 'extract-colors', label: '2. /extract-colors' },
            { id: 'squircle', label: '3. /squircle (G2 Bezier)' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                playClickSound(soundEnabled, 700);
                setActiveTab(t.id);
              }}
              className={`flex-1 py-2 rounded-lg uppercase transition-all cursor-pointer ${
                activeTab === t.id ? 'bg-[#C0FE04] text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: COLOR SPACE EXPLORER */}
        {activeTab === 'color' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              style={{ backgroundColor: currentOklch }}
              className="p-8 rounded-2xl border border-white/10 min-h-[200px] flex flex-col justify-between shadow-2xl transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs bg-black/60 text-white px-2 py-1 rounded">
                  {currentOklch}
                </span>
                {isOutOfGamut && (
                  <span className="font-mono text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                    Gamut Clip Warning
                  </span>
                )}
              </div>

              <div className="bg-black/60 p-3 rounded-xl backdrop-blur-sm text-xs font-mono text-white/90">
                L: {(lightness * 100).toFixed(0)}% | C: {chroma.toFixed(2)} | H: {hue}°
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1 bg-[#05070d] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between">
                  <span>Lightness (L):</span>
                  <span className="text-[#C0FE04]">{(lightness * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.01"
                  value={lightness}
                  onChange={(e) => setLightness(Number(e.target.value))}
                  className="w-full accent-[#C0FE04] cursor-pointer"
                />
              </div>

              <div className="space-y-1 bg-[#05070d] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between">
                  <span>Chroma (C):</span>
                  <span className="text-[#C0FE04]">{chroma.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.37"
                  step="0.01"
                  value={chroma}
                  onChange={(e) => setChroma(Number(e.target.value))}
                  className="w-full accent-[#C0FE04] cursor-pointer"
                />
              </div>

              <div className="space-y-1 bg-[#05070d] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between">
                  <span>Hue (H):</span>
                  <span className="text-[#C0FE04]">{hue}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="w-full accent-[#C0FE04] cursor-pointer"
                />
              </div>

              <button
                onClick={() => copyString(currentOklch)}
                className="w-full py-2.5 bg-[#C0FE04] text-black font-bold uppercase rounded-xl hover:bg-[#a8e003] transition-colors cursor-pointer"
              >
                {copied ? 'Copied OKLCH!' : 'Copy OKLCH Color String'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EXTRACT COLORS PALETTE */}
        {activeTab === 'extract-colors' && (
          <div className="space-y-6">
            <div className="p-8 border-2 border-dashed border-[#1d3d8f] hover:border-[#C0FE04] rounded-2xl bg-[#05070d] text-center space-y-2 cursor-pointer transition-colors">
              <div className="text-3xl">🖼️</div>
              <h4 className="font-bold text-sm text-[#C0FE04]">WASM Quantization Dropzone</h4>
              <p className="font-mono text-xs text-white/50">Drop image here to extract P3 harmonious OKLCH palettes via client-side WebAssembly.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
              {extractedPalette.map((p, i) => (
                <div key={i} className="bg-[#05070d] border border-white/10 rounded-2xl p-3 space-y-2">
                  <div style={{ backgroundColor: p.hex }} className="w-full h-16 rounded-xl shadow-inner" />
                  <div>
                    <span className="font-bold block text-white text-[11px]">{p.name}</span>
                    <span className="text-[10px] text-white/50 block">{p.hex}</span>
                    <span className="text-[9px] text-[#C0FE04] block truncate">{p.oklch}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SQUIRCLE GENERATOR */}
        {activeTab === 'squircle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-[#05070d] border border-white/10 flex flex-col items-center justify-center space-y-4">
              <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="drop-shadow-2xl">
                <path d={squirclePath} fill="#C0FE04" />
              </svg>
              <span className="font-mono text-xs text-white/60">G2 Continuous Curvature Superellipse</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1 bg-[#05070d] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between">
                  <span>Corner Radius (r):</span>
                  <span className="text-[#C0FE04]">{squircleRadius}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={squircleRadius}
                  onChange={(e) => setSquircleRadius(Number(e.target.value))}
                  className="w-full accent-[#C0FE04] cursor-pointer"
                />
              </div>

              <div className="space-y-1 bg-[#05070d] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between">
                  <span>Continuity Factor (s):</span>
                  <span className="text-[#C0FE04]">{squircleSmoothness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.99"
                  step="0.01"
                  value={squircleSmoothness}
                  onChange={(e) => setSquircleSmoothness(Number(e.target.value))}
                  className="w-full accent-[#C0FE04] cursor-pointer"
                />
              </div>

              <button
                onClick={() => copyString(squirclePath)}
                className="w-full py-2.5 bg-[#C0FE04] text-black font-bold uppercase rounded-xl hover:bg-[#a8e003] transition-colors cursor-pointer"
              >
                {copied ? 'Copied SVG Path!' : 'Copy SVG Cubic Bezier Path'}
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center font-mono text-xs text-white/60">
          <span>Module: Base64 Embedded ESM (0ms overhead)</span>
          <span className="text-[#C0FE04]">MIT Open Source</span>
        </div>
      </div>
    </div>
  );
}
