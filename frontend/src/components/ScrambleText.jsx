import React, { useState, useRef } from 'react';
import { playClickSound } from '../utils/audio';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#________010101■▲';

export default function ScrambleText({ text, className = "", soundEnabled = false, onClick }) {
  const [displayText, setDisplayText] = useState(text);
  const isScrambling = useRef(false);

  const handleMouseEnter = () => {
    if (isScrambling.current) return;
    isScrambling.current = true;
    playClickSound(soundEnabled, 750);

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) return text[index];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        isScrambling.current = false;
        setDisplayText(text);
      }

      iteration += 1 / 2;
    }, 28);
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      className={`inline-block select-none cursor-pointer transition-colors ${className}`}
    >
      {displayText}
    </span>
  );
}
