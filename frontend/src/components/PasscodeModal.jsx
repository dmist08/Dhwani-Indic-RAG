import React, { useState } from 'react';
import { playClickSound } from '../utils/audio';

export default function PasscodeModal({ soundEnabled, onClose, onUnlock }) {
  const [passcode, setPasscode] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [cipherText, setCipherText] = useState('0x7F_SECURE_VAULT_LOCKED');

  const handleUnlock = () => {
    setIsDecrypting(true);
    playClickSound(soundEnabled, 1200);

    const hexChars = '0123456789ABCDEF!@#$%^&*';
    let step = 0;

    const interval = setInterval(() => {
      let scramble = '';
      for (let i = 0; i < 18; i++) {
        scramble += hexChars[Math.floor(Math.random() * hexChars.length)];
      }
      setCipherText(`DECRYPTING: [${scramble}]`);
      playClickSound(soundEnabled, 400 + step * 40);
      step++;

      if (step >= 12) {
        clearInterval(interval);
        setCipherText('ACCESS GRANTED // DHVANI AI');
        setIsDecrypting(false);
        setTimeout(() => {
          onUnlock();
          onClose();
        }, 800);
      }
    }, 60);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#05070d] border-2 border-[#C0FE04] max-w-md w-full p-8 rounded-3xl space-y-6 shadow-2xl relative text-white font-mono">
        
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <span className="text-[#C0FE04] text-xs font-bold uppercase tracking-wider">
            [ACCESS_CONTROL_V2.0]
          </span>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="text-3xl">🔐</div>
          <h3 className="font-bold text-lg text-[#C0FE04]">Security Passcode</h3>
          <p className="text-xs text-white/60">
            Enter authorized access key to decrypt protected engineering records.
          </p>
        </div>

        <div className="p-4 bg-black/60 rounded-xl border border-white/10 text-center text-xs text-[#C0FE04] font-bold tracking-widest">
          {cipherText}
        </div>

        <input
          type="text"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Enter Passcode (e.g. 2026)..."
          className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-center text-sm text-[#C0FE04] focus:outline-none focus:border-[#C0FE04] uppercase tracking-widest"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUnlock}
            disabled={isDecrypting}
            className="flex-1 py-3 bg-[#C0FE04] hover:bg-[#a8e003] text-black text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer shadow-md"
          >
            {isDecrypting ? 'Decrypting...' : 'Authenticate'}
          </button>
        </div>
      </div>
    </div>
  );
}
