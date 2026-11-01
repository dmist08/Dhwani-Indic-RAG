import React, { useState } from 'react';
import { playClickSound } from '../utils/audio';

export default function ReunimosCaseStudy({ soundEnabled, onClose }) {
  const [filterMood, setFilterMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const items = [
    { id: 1, title: 'iMac G3 Bondi Blue Shell', mood: 'retro', color: '#0ea5e9', tag: 'Industrial Design', note: 'Translucent polycarbonate casing study' },
    { id: 2, title: 'Gujarati Lithograph Specimen', mood: 'archival', color: '#d97706', tag: 'Typography', note: '1890 Ahmedabad Letterpress imprint' },
    { id: 3, title: 'Star-6 Lens Flare Optical Dispersion', mood: 'shader', color: '#c0fe04', tag: 'WebGL Shader', note: 'Refraction & chromatic aberration' },
    { id: 4, title: 'Braun T3 Pocket Radio', mood: 'retro', color: '#f43f5e', tag: 'Dieter Rams', note: 'Pure functionalist analog knob layout' },
    { id: 5, title: 'Parent-Child Chunking Envelope', mood: 'ai', color: '#8b5cf6', tag: 'Retrieval Architecture', note: 'Hierarchical 150/600 char context resolution' },
    { id: 6, title: 'OKLCH Perceptual Gamut Spectrum', mood: 'shader', color: '#10b981', tag: 'Color Science', note: 'Uniform chroma interpolation' }
  ];

  const filtered = items.filter(item => {
    const matchesMood = filterMood === 'all' || item.mood === filterMood;
    const matchesSearch = searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMood && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
      <div className="bg-[#0c101c] border border-[#1d3d8f] max-w-4xl w-full p-6 lg:p-10 rounded-3xl space-y-6 shadow-2xl relative text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#C0FE04] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C0FE04]" />
              <span>REUNIMOS™ // AI VISUAL MEMORY BOARD (2024-2026)</span>
            </div>
            <h3 className="font-sans font-bold text-2xl lg:text-3xl uppercase tracking-tight mt-1">
              Personal Inspiration Collector
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
          Reunimos™ eliminates rigid folder hierarchies by leveraging multimodal AI embeddings to organize and retrieve inspiration based on visual impressions, color gamuts, and emotional moods.
        </p>

        {/* Interactive Mood Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex bg-[#05070d] p-1 rounded-xl border border-white/10 font-mono text-xs">
            {['all', 'retro', 'archival', 'shader', 'ai'].map(m => (
              <button
                key={m}
                onClick={() => {
                  playClickSound(soundEnabled, 700);
                  setFilterMood(m);
                }}
                className={`px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer ${
                  filterMood === m ? 'bg-[#C0FE04] text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visual impressions..."
            className="w-full sm:w-64 bg-[#05070d] border border-white/10 rounded-xl px-3.5 py-1.5 font-sans text-xs text-white focus:outline-none focus:border-[#C0FE04]"
          />
        </div>

        {/* Dynamic Inspiration Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => playClickSound(soundEnabled, 850)}
              style={{ borderColor: item.color }}
              className="bg-[#05070d]/90 border p-4 rounded-2xl space-y-3 cursor-pointer hover:scale-[1.02] transition-transform group relative overflow-hidden"
            >
              <div 
                style={{ backgroundColor: `${item.color}25` }}
                className="w-full h-24 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-[#C0FE04] transition-colors relative"
              >
                <div 
                  style={{ backgroundColor: item.color }} 
                  className="w-8 h-8 rounded-full shadow-lg" 
                />
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase text-[#C0FE04] font-semibold">{item.tag}</span>
                <h4 className="font-sans font-bold text-sm text-white group-hover:text-[#C0FE04] transition-colors">{item.title}</h4>
                <p className="font-sans text-[11px] text-white/60 mt-1">{item.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center font-mono text-xs text-white/60">
          <span>Engine: WebGL Shaders + Vector Space</span>
          <span className="text-[#C0FE04]">{filtered.length} Items Loaded</span>
        </div>
      </div>
    </div>
  );
}
