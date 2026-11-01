import React, { useEffect } from 'react';

export default function HeaderShortcutTooltip({ 
  visible, 
  onThemeChange, 
  onSoundToggle, 
  soundEnabled 
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'l') onThemeChange('light');
      else if (key === 'd') onThemeChange('dark');
      else if (key === 'a') onThemeChange('blue');
      else if (key === 's') onSoundToggle();
      else if (key === 't') window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (key === 'b') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onThemeChange, onSoundToggle]);

  if (!visible) return null;

  return (
    <div className="absolute right-4 lg:right-14 top-16 z-50 max-w-sm w-full bg-[#05070d]/95 border border-[#C0FE04]/40 rounded-2xl p-4 text-left font-mono text-[11px] text-white/90 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="space-y-2 leading-relaxed text-white/80">
        <p>
          Press <span className="text-[#C0FE04] font-bold">[L]</span> for light mode,{' '}
          <span className="text-[#C0FE04] font-bold">[D]</span> for dark mode,{' '}
          <span className="text-[#C0FE04] font-bold">[A]</span> for auto mode, or click <span className="text-white font-semibold">THEME</span>.{' '}
          Press <span className="text-[#C0FE04] font-bold">[S]</span> to pause or resume background music, or click <span className="text-white font-semibold">SOUND</span>; your choice is saved in this browser.{' '}
          <span className="text-[#C0FE04] font-bold">[T]</span> scroll to top,{' '}
          <span className="text-[#C0FE04] font-bold">[B]</span> scroll to bottom.
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-white/50">
        <span>Google Chrome</span>
        <span>{window.innerWidth} × {window.innerHeight}</span>
      </div>
    </div>
  );
}
