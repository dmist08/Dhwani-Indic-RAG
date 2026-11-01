import React, { useState, useEffect } from 'react';
import TelemetryHUD from './components/TelemetryHUD';
import PixelSnakeTrail from './components/PixelSnakeTrail';
import HeaderShortcutTooltip from './components/HeaderShortcutTooltip';
import GlassHelloShaderScene from './components/GlassHelloShaderScene';
import DraggableSticker from './components/DraggableSticker';
import ScrambleText from './components/ScrambleText';
import BioAvatarSection from './components/BioAvatarSection';
import VoiceRAGConsole from './components/VoiceRAGConsole';
import HoverRevealCard from './components/HoverRevealCard';
import WarpTunnelSection from './components/WarpTunnelSection';
import FooterInflatableScene from './components/FooterInflatableScene';
import ReunimosCaseStudy from './components/ReunimosCaseStudy';
import InspireMonoPlayground from './components/InspireMonoPlayground';
import WasmUtilsPlayground from './components/WasmUtilsPlayground';
import CaseStudyADrive from './components/CaseStudyADrive';
import { playClickSound, toggleAmbientSoundscape, updateAmbientFilterFromMouse } from './utils/audio';

export default function App() {
  const [theme, setTheme] = useState('blue'); // 'blue', 'dark', 'light'
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showShortcutTooltip, setShowShortcutTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [coords, setCoords] = useState({ x: '0864', y: '0839' });
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  // Active Interactive Case Study Modals
  const [activeCaseStudy, setActiveCaseStudy] = useState(null);

  // Dynamic Spawning Stickers on background click
  const [spawnedStickers, setSpawnedStickers] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const x = String(e.clientX).padStart(4, '0');
      const y = String(e.clientY).padStart(4, '0');
      setCoords({ x, y });

      updateAmbientFilterFromMouse(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const cycleTheme = () => {
    playClickSound(soundEnabled, 700);
    if (theme === 'blue') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('blue');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    toggleAmbientSoundscape(next);
    playClickSound(next, 950);
  };

  const handleBackgroundSpawn = (e) => {
    if (e.target.tagName !== 'SECTION' && !e.target.classList.contains('bg-spawn-area')) return;
    const stickerEmojis = ['⭐', '💖', '⚡', '👨‍🚀', '😊', '🌑', '✨', '🪐', '💻', '🎨'];
    const randomEmoji = stickerEmojis[Math.floor(Math.random() * stickerEmojis.length)];
    const newSticker = {
      id: Date.now(),
      emoji: randomEmoji,
      x: e.clientX - 20,
      y: e.clientY - 20,
      rotate: (Math.random() - 0.5) * 45
    };
    setSpawnedStickers(prev => [...prev.slice(-12), newSticker]);
    playClickSound(soundEnabled, 1100);
  };

  const projects = [
    {
      id: 'parent_child',
      title: 'Dhvani Indic Voice RAG',
      year: '2026',
      tag: 'HERO AI ENGINE',
      desc: 'Voice-to-voice RAG pipeline on AI4Bharat MSMARCO-XI with sub-100ms P100 latency, 5-way vast chunking, 3-layer guardrails, and multi-speaker TTS.',
      stats: 'Sub-200ms Verified ↗'
    },
    {
      id: 'reunimos',
      title: 'REUNIMOS™',
      year: '2024-2026',
      tag: 'CODING PROJECT',
      desc: 'Multimodal AI inspiration canvas organizing visual impressions without rigid folders. Features continuous squircles and OKLCH color-space search.',
      stats: 'Interactive App ↗'
    },
    {
      id: 'inspire_mono',
      title: 'Inspire Mono',
      year: '2025',
      tag: 'CODING PROJECT',
      desc: 'Developer-first high-contrast monospace typeface with OpenType coding ligatures, stylistic sets, and full Unicode glyph inspector.',
      stats: '12PX CAPSULE ↗'
    },
    {
      id: 'wasm_design_utils',
      title: 'WASM DESIGN UTILS',
      year: '2025',
      tag: 'CODING PROJECT',
      desc: 'High-performance WebAssembly design suite: OKLCH color explorer, image palette quantizer, and continuous curvature squircle SVG generator.',
      stats: 'npm i @wenhaoqi/wasm_design_utils'
    },
    {
      id: 'adrive',
      title: 'ADRIVE 阿里云盘',
      year: '2020-2022',
      tag: 'ENTERPRISE',
      desc: 'Alibaba cloud storage ecosystem design system, multi-platform token pipeline, and smart photo timeline experience.',
      stats: 'Alibaba Cloud ADS'
    },
    {
      id: 'shore_icon',
      title: 'SHORE ICON',
      year: '2022',
      tag: 'ICON SYSTEM',
      desc: 'Unified enterprise stroke icon system with optical balance grids and stroke weight normalizer.',
      stats: '200+ Icons'
    },
    {
      id: 'teambition',
      title: 'TEAMBITION',
      year: '2018-2020',
      tag: 'ENTERPRISE',
      desc: 'High-density agile project management and cloud netdisk architecture serving enterprise collaboration workflows.',
      stats: 'Alibaba Cloud'
    },
    {
      id: 'fof_see_hear',
      title: 'FOF: SEE HEAR TOUCH',
      year: '2022',
      tag: 'EVENT ↗',
      desc: 'Sensory design workshop and interactive sound installation for Friends of Figma.',
      stats: 'Exhibition'
    }
  ];

  // Theme Styling Matrix
  const bgClass =
    theme === 'blue'
      ? 'bg-[#020b24] text-white'
      : theme === 'dark'
      ? 'bg-[#0D0E11] text-[#F0F3F8]'
      : 'bg-[#F7F9FB] text-[#16181D]';

  return (
    <>
      {/* 1. RETRO PIXEL SNAKE CURSOR TRAIL */}
      <PixelSnakeTrail />

      {/* 2. RETRO ASCII TELEMETRY HUD */}
      {isTelemetryOpen && (
        <TelemetryHUD
          soundEnabled={soundEnabled}
          onClose={() => setIsTelemetryOpen(false)}
        />
      )}

      {/* MAIN CONTAINER */}
      <div 
        onDoubleClick={handleBackgroundSpawn}
        className={`min-h-screen ${bgClass} font-sans selection:bg-[#C0FE04] selection:text-black relative overflow-x-hidden transition-colors duration-300`}
      >
        
        {/* ARCHITECTURAL GRID OVERLAY WITH CROSSHAIRS */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="w-full h-full bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:12.5%_16.666%] opacity-40" />
          <div className="absolute top-1/4 left-1/4 text-[#3b82f6]/40 font-mono text-xs select-none">+</div>
          <div className="absolute top-1/4 right-1/4 text-[#3b82f6]/40 font-mono text-xs select-none">+</div>
          <div className="absolute top-2/4 left-1/4 text-[#3b82f6]/40 font-mono text-xs select-none">+</div>
          <div className="absolute top-2/4 right-1/4 text-[#3b82f6]/40 font-mono text-xs select-none">+</div>
          <div className="absolute top-3/4 left-1/4 text-[#3b82f6]/40 font-mono text-xs select-none">+</div>
          <div className="absolute top-3/4 right-1/4 text-[#3b82f6]/40 font-mono text-xs select-none">+</div>
        </div>

        {/* RIGHT VERTICAL SCROLL PROGRESS TRACK */}
        <div className="fixed right-3 top-1/3 z-50 w-1.5 h-32 bg-white/10 rounded-full overflow-hidden pointer-events-none hidden lg:block">
          <div className="w-full h-10 bg-white rounded-full" />
        </div>

        {/* TOP FIXED NAVIGATION HEADER */}
        <header className="fixed top-0 inset-x-0 z-50 flex justify-between items-center px-4 lg:px-14 py-4 lg:py-7 font-mono text-xs uppercase backdrop-blur-md pointer-events-auto">
          <a 
            href="#" 
            onClick={() => {
              playClickSound(soundEnabled, 800);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="relative before:content-[''] before:absolute before:inset-0 before:border-2 before:border-dotted before:border-transparent hover:before:border-current p-2 font-sans font-bold text-sm tracking-wider uppercase transition-colors"
          >
            <ScrambleText text="DHVANI.VOICE.RAG" soundEnabled={soundEnabled} />
          </a>

          <div 
            onMouseEnter={() => setShowShortcutTooltip(true)}
            onMouseLeave={() => setShowShortcutTooltip(false)}
            className="flex items-center gap-3 lg:gap-8 relative"
          >
            <a 
              href="#voice-console" 
              onClick={() => playClickSound(soundEnabled, 600)}
              className="relative before:content-[''] before:absolute before:inset-0 before:border-2 before:border-dotted before:border-transparent hover:before:border-current p-2 uppercase hidden sm:inline transition-colors text-[#C0FE04]"
            >
              <ScrambleText text="VOICE RETRIEVAL & TTS" soundEnabled={soundEnabled} />
            </a>
            <a 
              href="#selected-work" 
              onClick={() => playClickSound(soundEnabled, 600)}
              className="relative before:content-[''] before:absolute before:inset-0 before:border-2 before:border-dotted before:border-transparent hover:before:border-current p-2 uppercase hidden sm:inline transition-colors"
            >
              <ScrambleText text="RESEARCH LABS" soundEnabled={soundEnabled} />
            </a>
            <a 
              href="#contact" 
              onClick={() => playClickSound(soundEnabled, 600)}
              className="relative before:content-[''] before:absolute before:inset-0 before:border-2 before:border-dotted before:border-transparent hover:before:border-current p-2 uppercase hidden sm:inline transition-colors"
            >
              <ScrambleText text="CONTACT" soundEnabled={soundEnabled} />
            </a>
            
            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="relative before:content-[''] before:absolute before:inset-0 before:border-2 before:border-dotted before:border-transparent hover:before:border-current p-2 uppercase transition-colors cursor-pointer"
            >
              THEME[{theme === 'blue' ? 'A' : theme === 'dark' ? 'D' : 'L'}]
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`relative before:content-[''] before:absolute before:inset-0 before:border-2 before:border-dotted before:border-transparent hover:before:border-current p-2 uppercase transition-colors cursor-pointer ${soundEnabled ? 'text-[#C0FE04]' : ''}`}
            >
              SOUND[{soundEnabled ? '•' : '-'}]
            </button>

            {/* Secret Matrix Button */}
            <button
              onClick={() => setIsTelemetryOpen(true)}
              className="px-2 py-1 bg-white/10 hover:bg-[#C0FE04] hover:text-black rounded font-mono text-[11px] uppercase transition-colors cursor-pointer"
            >
              ■■■■■■
            </button>

            {/* Shortcut Info Tooltip Dropdown */}
            <HeaderShortcutTooltip
              visible={showShortcutTooltip}
              onThemeChange={setTheme}
              onSoundToggle={toggleSound}
              soundEnabled={soundEnabled}
            />
          </div>
        </header>

        {/* HERO SCREEN CONTAINER */}
        <section className="bg-spawn-area relative w-full h-screen min-h-[700px] flex flex-col justify-between px-4 lg:px-14 pt-20 pb-12 overflow-hidden">
          
          {/* 3D Glass Refraction Shader & Falling Particles Canvas */}
          <GlassHelloShaderScene mousePos={mousePos} theme={theme} />

          {/* TOP METADATA GRID */}
          <div className="grid grid-cols-12 gap-4 font-mono text-xs z-20 relative pt-4 pointer-events-auto">
            <div className="col-span-12 lg:col-span-3 font-sans font-bold text-2xl lg:text-3xl leading-tight uppercase text-[#C0FE04]">
              Voice RAG &<br />Multi-Speaker TTS
            </div>

            <div className="col-span-12 lg:col-span-3 opacity-75 leading-relaxed">
              HH Goa 2026 Shortlisting Task 2<br />End-to-End Indic Retrieval Pipeline.
            </div>

            <div className="col-span-12 lg:col-span-6 opacity-85 leading-relaxed">
              Spoken question to speech output pipeline using{' '}
              <span 
                onClick={() => setIsTelemetryOpen(true)}
                className="inline-flex items-center gap-1 bg-white/20 hover:bg-[#C0FE04] hover:text-black px-1.5 py-0.5 rounded font-mono text-[10px] cursor-pointer transition-colors"
              >
                AI4BHARAT MSMARCO-XI
              </span>
              , Qdrant HNSW vector index, sub-100ms P100 latency, and multi-speaker voice synthesis.
            </div>
          </div>

          {/* DRAGGABLE & INTERACTIVE FLOATING STICKERS */}
          <div className="absolute inset-0 pointer-events-auto z-30">
            
            {/* Reunimos 2026 Coin Stamp */}
            <DraggableSticker initialX={window.innerWidth * 0.05} initialY={window.innerHeight * 0.20} initialRotate={-15} soundEnabled={soundEnabled}>
              <div 
                onClick={() => setActiveCaseStudy('reunimos')}
                className="w-24 h-24 rounded-full border-2 border-dashed border-[#d4af37] bg-[#1e1b18]/90 text-[#d4af37] flex flex-col items-center justify-center font-mono text-[9px] uppercase shadow-2xl backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer"
              >
                <span className="font-bold">REUNIMOS</span>
                <span>2026</span>
              </div>
            </DraggableSticker>

            {/* Holographic Pen Nib */}
            <DraggableSticker initialX={window.innerWidth * 0.16} initialY={window.innerHeight * 0.32} initialRotate={25} soundEnabled={soundEnabled}>
              <div 
                onClick={() => setActiveCaseStudy('inspire_mono')}
                className="w-14 h-14 bg-gradient-to-tr from-slate-200 to-white rounded-2xl shadow-xl flex items-center justify-center border border-white hover:scale-110 transition-transform cursor-pointer"
              >
                <div className="w-4 h-4 bg-slate-900 rounded-full" />
              </div>
            </DraggableSticker>

            {/* Yellow Star Sticker */}
            <DraggableSticker initialX={window.innerWidth * 0.40} initialY={window.innerHeight * 0.14} initialRotate={-5} soundEnabled={soundEnabled}>
              <div className="text-4xl hover:scale-125 transition-transform drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] cursor-pointer">
                ⭐
              </div>
            </DraggableSticker>

            {/* Glossy Red/Pink Heart */}
            <DraggableSticker initialX={window.innerWidth * 0.47} initialY={window.innerHeight * 0.15} initialRotate={8} soundEnabled={soundEnabled}>
              <div className="text-4xl hover:scale-125 transition-transform drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] cursor-pointer">
                💖
              </div>
            </DraggableSticker>

            {/* Pixel Art Moon */}
            <DraggableSticker initialX={window.innerWidth * 0.54} initialY={window.innerHeight * 0.08} initialRotate={-10} soundEnabled={soundEnabled}>
              <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-black flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform cursor-pointer">
                🌑
              </div>
            </DraggableSticker>

            {/* 2026 Badge over "hello" */}
            <DraggableSticker initialX={window.innerWidth * 0.36} initialY={window.innerHeight * 0.40} initialRotate={-8} soundEnabled={soundEnabled}>
              <div className="font-mono font-extrabold text-sm px-2.5 py-1 bg-rose-500 text-white rounded border border-white shadow-xl hover:scale-110 transition-transform cursor-pointer">
                2026
              </div>
            </DraggableSticker>

            {/* Retro Cartoon Astronaut */}
            <DraggableSticker initialX={window.innerWidth * 0.22} initialY={window.innerHeight * 0.72} initialRotate={-12} soundEnabled={soundEnabled}>
              <div className="w-16 h-16 rounded-full bg-amber-200 border-2 border-black flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-transform cursor-pointer">
                👨‍🚀
              </div>
            </DraggableSticker>

            {/* Yellow Smiley Face */}
            <DraggableSticker initialX={window.innerWidth * 0.35} initialY={window.innerHeight * 0.74} initialRotate={14} soundEnabled={soundEnabled}>
              <div className="w-14 h-14 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-transform cursor-pointer">
                😊
              </div>
            </DraggableSticker>

            {/* Blue Lightning Bolt */}
            <DraggableSticker initialX={window.innerWidth * 0.28} initialY={window.innerHeight * 0.88} initialRotate={45} soundEnabled={soundEnabled}>
              <div className="text-4xl hover:scale-125 transition-transform drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] cursor-pointer">
                ⚡
              </div>
            </DraggableSticker>

            {/* Dynamically Spawned Stickers */}
            {spawnedStickers.map(s => (
              <DraggableSticker key={s.id} initialX={s.x} initialY={s.y} initialRotate={s.rotate} soundEnabled={soundEnabled}>
                <div className="text-4xl hover:scale-125 transition-transform drop-shadow-xl animate-bounce">
                  {s.emoji}
                </div>
              </DraggableSticker>
            ))}

          </div>

          {/* BOTTOM GIANT HEADLINE */}
          <div className="z-20 relative pointer-events-auto">
            <h1 className="text-[7.5vw] lg:text-[5.5vw] font-bold uppercase leading-[0.9] tracking-tighter">
              VOICE IN<br />
              GROUNDED RETRIEVAL<br />
              SPEECH OUT
            </h1>
          </div>

          {/* BOTTOM FIXED STATUS BAR */}
          <div className="flex justify-between items-center font-mono text-xs uppercase opacity-75 z-20 pt-4">
            <span>MSMARCO-XI INDIC BENCHMARK</span>
            <span className="hidden sm:inline">{coords.x} X {coords.y} Y</span>
            <span className="text-[#C0FE04] font-bold">LATENCY &lt; 200MS VERIFIED</span>
          </div>
        </section>

        {/* SECTION 2: PRODUCTION VOICE RAG CONSOLE WITH MULTI-SPEAKER TTS */}
        <section id="voice-console" className="py-24 px-4 lg:px-14 max-w-[1500px] mx-auto z-20 relative border-t border-white/10">
          <VoiceRAGConsole soundEnabled={soundEnabled} />
        </section>

        {/* SECTION 3: BIO WITH AVATAR & SIGNATURE */}
        <BioAvatarSection
          soundEnabled={soundEnabled}
          onSelectCaseStudy={setActiveCaseStudy}
        />

        {/* SECTION 4: SELECTED WORK (CIRCULAR HOVER-REVEAL GRID) */}
        <section id="selected-work" className="py-24 px-4 lg:px-14 max-w-[1500px] mx-auto z-20 relative border-t border-white/10">
          <div className="flex items-center justify-between font-mono text-xs uppercase mb-12 opacity-80">
            <span>02 // SELECTED RESEARCH WORK & TOOLS</span>
            <span className="opacity-50">2024-2026</span>
          </div>

          <div className="grid grid-cols-12 gap-y-12 gap-x-6">
            {projects.map((p, idx) => {
              const colSpanClass =
                idx === 0
                  ? 'col-span-12 lg:col-span-8 lg:col-start-5'
                  : idx === 1
                  ? 'col-span-12 lg:col-span-6 xl:col-span-5'
                  : idx === 2
                  ? 'col-span-12 lg:col-span-6 xl:col-span-5 lg:col-start-7'
                  : idx === 3
                  ? 'col-span-6 lg:col-span-4 lg:col-start-5'
                  : idx === 4
                  ? 'col-span-6 lg:col-span-4 lg:col-start-9'
                  : 'col-span-12 lg:col-span-6 lg:col-start-1';

              return (
                <HoverRevealCard
                  key={p.id}
                  project={p}
                  index={idx}
                  colSpanClass={colSpanClass}
                  soundEnabled={soundEnabled}
                  theme={theme}
                  onClick={() => {
                    playClickSound(soundEnabled, 800);
                    if (p.id === 'reunimos') setActiveCaseStudy('reunimos');
                    else if (p.id === 'inspire_mono') setActiveCaseStudy('inspire_mono');
                    else if (p.id === 'wasm_design_utils') setActiveCaseStudy('wasm_design_utils');
                    else if (p.id === 'adrive') setActiveCaseStudy('adrive');
                  }}
                />
              );
            })}
          </div>
        </section>

        {/* SECTION 5: HYPERSPACE WARP TUNNEL */}
        <WarpTunnelSection />

        {/* SECTION 6: FOOTER WITH 3D INFLATABLE "CRAFT & TASTE" */}
        <FooterInflatableScene
          mousePos={mousePos}
          soundEnabled={soundEnabled}
          coords={coords}
        />

        {/* ACTIVE CASE STUDY MODALS */}
        {activeCaseStudy === 'reunimos' && (
          <ReunimosCaseStudy 
            soundEnabled={soundEnabled} 
            onClose={() => setActiveCaseStudy(null)} 
          />
        )}

        {activeCaseStudy === 'inspire_mono' && (
          <InspireMonoPlayground 
            soundEnabled={soundEnabled} 
            onClose={() => setActiveCaseStudy(null)} 
          />
        )}

        {activeCaseStudy === 'wasm_design_utils' && (
          <WasmUtilsPlayground 
            soundEnabled={soundEnabled} 
            onClose={() => setActiveCaseStudy(null)} 
          />
        )}

        {activeCaseStudy === 'adrive' && (
          <CaseStudyADrive 
            soundEnabled={soundEnabled} 
            onClose={() => setActiveCaseStudy(null)} 
          />
        )}

      </div>
    </>
  );
}
