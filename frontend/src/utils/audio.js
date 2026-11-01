// Web Audio API Generative Ambient Soundscape & Click Synthesizer
let audioCtx = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientGain = null;
let ambientFilter = null;
let isAmbientPlaying = false;

const initAudio = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playClickSound = (enabled = true, freq = 600, type = 'sine') => {
  if (!enabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {}
};

export const toggleAmbientSoundscape = (enable) => {
  try {
    initAudio();
    if (!audioCtx) return false;

    if (enable && !isAmbientPlaying) {
      // Create dual-oscillator ambient chord (E2 + B2 / E3)
      ambientFilter = audioCtx.createBiquadFilter();
      ambientFilter.type = 'lowpass';
      ambientFilter.frequency.setValueAtTime(450, audioCtx.currentTime);

      ambientGain = audioCtx.createGain();
      ambientGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      ambientGain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 2.0);

      ambientOsc1 = audioCtx.createOscillator();
      ambientOsc1.type = 'sine';
      ambientOsc1.frequency.setValueAtTime(82.41, audioCtx.currentTime); // E2

      ambientOsc2 = audioCtx.createOscillator();
      ambientOsc2.type = 'triangle';
      ambientOsc2.frequency.setValueAtTime(123.47, audioCtx.currentTime); // B2

      ambientOsc1.connect(ambientFilter);
      ambientOsc2.connect(ambientFilter);
      ambientFilter.connect(ambientGain);
      ambientGain.connect(audioCtx.destination);

      ambientOsc1.start();
      ambientOsc2.start();
      isAmbientPlaying = true;
      return true;
    } else if (!enable && isAmbientPlaying) {
      if (ambientGain) {
        ambientGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        setTimeout(() => {
          try {
            ambientOsc1?.stop();
            ambientOsc2?.stop();
            ambientOsc1?.disconnect();
            ambientOsc2?.disconnect();
          } catch (e) {}
          isAmbientPlaying = false;
        }, 500);
      }
      return false;
    }
  } catch (e) {
    return false;
  }
  return isAmbientPlaying;
};

export const updateAmbientFilterFromMouse = (xRatio, yRatio) => {
  if (isAmbientPlaying && ambientFilter && audioCtx) {
    const freq = 200 + xRatio * 800 + (1 - yRatio) * 400;
    ambientFilter.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
  }
};
