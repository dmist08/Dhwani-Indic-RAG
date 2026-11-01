import React, { useState } from 'react';
import { playClickSound } from '../utils/audio';

export default function InspireMonoPlayground({ soundEnabled, onClose }) {
  const [sampleText, setSampleText] = useState('const retrieve = async (query: Indic) => {\n  if (query.lang === "gu") return await hnsw.search(query);\n  return [1337, 404, 2026];\n}; // != === -> >= <=');
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState(600);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [lineHeight, setLineHeight] = useState(1.6);

  // OpenType Features
  const [calt, setCalt] = useState(true);
  const [ss01, setSs01] = useState(true); // Slashed Zero
  const [ss02, setSs02] = useState(false); // Alternate curved 'l'
  const [ss03, setSs03] = useState(false); // Geometric Punctuation

  // Glyph Inspector
  const [showGlyphInspector, setShowGlyphInspector] = useState(false);
  const [selectedGlyph, setSelectedGlyph] = useState(null);
  const [copied, setCopied] = useState(false);

  const glyphList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:',.<>?/~`§±©®™".split("");

  const copyTokens = () => {
    playClickSound(soundEnabled, 1000);
    const fontFeatureSettings = `"calt" ${calt ? 1 : 0}, "ss01" ${ss01 ? 1 : 0}, "ss02" ${ss02 ? 1 : 0}, "ss03" ${ss03 ? 1 : 0}`;
    const token = `font-family: "Inspire Mono", "JetBrains Mono", monospace;\nfont-size: ${fontSize}px;\nfont-weight: ${fontWeight};\nletter-spacing: ${letterSpacing}px;\nline-height: ${lineHeight};\nfont-feature-settings: ${fontFeatureSettings};`;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
      <div className="bg-[#0c101c] border border-[#1d3d8f] max-w-5xl w-full p-6 lg:p-10 rounded-3xl space-y-6 shadow-2xl relative text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#C0FE04] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C0FE04]" />
              <span>INSPIRE MONO // EXPERIMENTAL TYPE ENGINE & PLAYGROUND (2025)</span>
            </div>
            <h3 className="font-sans font-bold text-2xl lg:text-3xl uppercase tracking-tight mt-1">
              Developer-First Monospace Typography System
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClickSound(soundEnabled, 700);
                setShowGlyphInspector(!showGlyphInspector);
              }}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-[#C0FE04] hover:text-black font-mono text-xs uppercase rounded-xl transition-colors cursor-pointer"
            >
              {showGlyphInspector ? 'Close Inspector' : 'Glyph Matrix'}
            </button>

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
        </div>

        {/* Live Typographic Canvas */}
        {!showGlyphInspector ? (
          <div className="p-8 rounded-2xl bg-[#05070d] border border-white/10 min-h-[220px] flex items-center justify-center overflow-x-auto">
            <pre
              style={{
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                letterSpacing: `${letterSpacing}px`,
                lineHeight: lineHeight,
                fontFamily: '"JetBrains Mono", monospace',
                fontFeatureSettings: `"calt" ${calt ? 1 : 0}, "ss01" ${ss01 ? 1 : 0}, "ss02" ${ss02 ? 1 : 0}, "ss03" ${ss03 ? 1 : 0}`
              }}
              className="text-[#C0FE04] text-left select-text whitespace-pre-wrap w-full font-mono"
            >
              {sampleText}
            </pre>
          </div>
        ) : (
          /* Glyph Grid Inspector Modal */
          <div className="p-6 rounded-2xl bg-[#05070d] border border-white/10 space-y-4">
            <div className="flex justify-between items-center font-mono text-xs text-white/60">
              <span>UNICODE CHARACTER MATRIX (256 CODEPOINTS)</span>
              <span>{selectedGlyph ? `Selected: ${selectedGlyph} (U+${selectedGlyph.charCodeAt(0).toString(16).toUpperCase()})` : 'Hover to inspect'}</span>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-2 max-h-60 overflow-y-auto p-2">
              {glyphList.map((g, i) => (
                <div
                  key={i}
                  onMouseEnter={() => {
                    setSelectedGlyph(g);
                    playClickSound(soundEnabled, 1200 + i * 5);
                  }}
                  className="w-9 h-9 bg-white/5 hover:bg-[#C0FE04] hover:text-black border border-white/10 rounded-lg flex items-center justify-center font-mono text-sm cursor-pointer transition-all hover:scale-110"
                >
                  {g}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editable Specimen Input */}
        <div>
          <label className="font-mono text-xs text-white/60 block mb-1.5 uppercase">Live Code Input Stage:</label>
          <textarea
            rows="3"
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            className="w-full bg-[#05070d] border border-white/10 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-[#C0FE04] resize-none"
          />
        </div>

        {/* Sliders and OpenType Feature Switches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-mono text-xs">
          
          {/* Sliders */}
          <div className="grid grid-cols-2 gap-3 bg-[#05070d] p-4 rounded-xl border border-white/10">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="text-[#C0FE04]">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="42"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#C0FE04] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Weight:</span>
                <span className="text-[#C0FE04]">{fontWeight}</span>
              </div>
              <input
                type="range"
                min="300"
                max="900"
                step="100"
                value={fontWeight}
                onChange={(e) => setFontWeight(Number(e.target.value))}
                className="w-full accent-[#C0FE04] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Tracking:</span>
                <span className="text-[#C0FE04]">{letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="-2"
                max="8"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))}
                className="w-full accent-[#C0FE04] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Leading:</span>
                <span className="text-[#C0FE04]">{lineHeight}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.4"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-[#C0FE04] cursor-pointer"
              />
            </div>
          </div>

          {/* OpenType Feature Toggles */}
          <div className="grid grid-cols-2 gap-3 bg-[#05070d] p-4 rounded-xl border border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={calt} 
                onChange={(e) => { playClickSound(soundEnabled, 700); setCalt(e.target.checked); }}
                className="accent-[#C0FE04]" 
              />
              <span>{"calt (Ligatures !=, ->)"}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={ss01} 
                onChange={(e) => { playClickSound(soundEnabled, 700); setSs01(e.target.checked); }}
                className="accent-[#C0FE04]" 
              />
              <span>ss01 (Slashed Zero)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={ss02} 
                onChange={(e) => { playClickSound(soundEnabled, 700); setSs02(e.target.checked); }}
                className="accent-[#C0FE04]" 
              />
              <span>ss02 (Curved `l` & `g`)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={ss03} 
                onChange={(e) => { playClickSound(soundEnabled, 700); setSs03(e.target.checked); }}
                className="accent-[#C0FE04]" 
              />
              <span>ss03 (Geometric Punct)</span>
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center font-mono text-xs">
          <span className="text-white/60">Metrics: TikTok Sans & Geist Base Align</span>
          <button
            onClick={copyTokens}
            className="px-5 py-2.5 bg-[#C0FE04] text-black font-bold uppercase rounded-xl hover:bg-[#a8e003] transition-colors cursor-pointer"
          >
            {copied ? 'Copied Tokens!' : 'Copy CSS Tokens'}
          </button>
        </div>
      </div>
    </div>
  );
}
