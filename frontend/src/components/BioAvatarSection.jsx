import React from 'react';
import { playClickSound } from '../utils/audio';

export default function BioAvatarSection({ soundEnabled, onSelectCaseStudy }) {
  return (
    <section className="py-24 px-4 lg:px-14 max-w-[1500px] mx-auto z-20 relative border-t border-white/10 select-none">
      <div className="grid grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* Left: Avatar with Handwritten "Haoqi" Signature */}
        <div className="col-span-12 lg:col-span-4 flex justify-center lg:justify-start">
          <div className="relative w-64 h-72 sm:w-72 sm:h-80 rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-to-tr from-[#020b24] via-[#05143d] to-[#00E5FF]/20 shadow-2xl group hover:border-[#C0FE04] transition-all">
            
            {/* Ambient Lighting Face Silhouette */}
            <div className="w-full h-full flex flex-col justify-end p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C0FE04]/30 via-transparent to-transparent">
              <div className="w-full h-full rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center relative overflow-hidden">
                <span className="text-6xl">👨‍💻</span>
              </div>
            </div>

            {/* Handwritten "Haoqi" Signature Overlay */}
            <div className="absolute top-4 left-4 z-20">
              <span 
                style={{ fontFamily: '"Brush Script MT", "Comic Sans MS", cursive' }}
                className="text-4xl text-[#C0FE04] font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] -rotate-6 block select-none"
              >
                Haoqi
              </span>
            </div>

            {/* Bottom Tag */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-center font-mono text-[10px] uppercase text-white/70">
              <span>DESIGN ENGINEER</span>
              <span className="text-[#C0FE04]">TIKTOK AI</span>
            </div>
          </div>
        </div>

        {/* Right: Bio Statement Typography */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase leading-tight tracking-tight text-white/95">
            I explore how to shape AI-era workflows with craft and taste, building the next generation of digital products.
          </h2>

          <p className="text-lg sm:text-2xl font-medium leading-relaxed text-white/80">
            I'm building{' '}
            <button
              onClick={() => {
                playClickSound(soundEnabled, 800);
                onSelectCaseStudy('reunimos');
              }}
              className="text-[#C0FE04] underline underline-offset-8 decoration-dotted hover:decoration-solid font-bold cursor-pointer transition-all"
            >
              reunimos™
            </button>
            , and previously worked on Alibaba{' '}
            <button
              onClick={() => {
                playClickSound(soundEnabled, 800);
                onSelectCaseStudy('adrive');
              }}
              className="text-white hover:text-[#C0FE04] underline underline-offset-8 decoration-dotted font-bold cursor-pointer transition-all"
            >
              aDrive
            </button>
            ,{' '}
            <button
              onClick={() => {
                playClickSound(soundEnabled, 800);
                onSelectCaseStudy('adrive');
              }}
              className="text-white hover:text-[#C0FE04] underline underline-offset-8 decoration-dotted font-bold cursor-pointer transition-all"
            >
              Teambition
            </button>
            , and 100offer.
          </p>
        </div>

      </div>
    </section>
  );
}
