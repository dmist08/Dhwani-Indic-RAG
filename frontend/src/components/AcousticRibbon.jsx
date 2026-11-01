import React, { useEffect, useRef } from 'react';

export default function AcousticRibbon({ isRecording, isLoading, onToggleRecord, language }) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let frame = 0;

    const render = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const midY = height / 2;
      let micVolume = 0.0;

      if (isRecording && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const sum = dataArrayRef.current.reduce((acc, v) => acc + v, 0);
        micVolume = (sum / dataArrayRef.current.length) / 128.0;
      }

      // Draw 3 layered acoustic ribbons (Harmonic Madder & Ochre Ink)
      const ribbons = [
        { color: 'rgba(168, 50, 38, 0.90)', width: 2.5, speed: 0.045, ampMultiplier: 1.0, freq: 0.035 },
        { color: 'rgba(184, 122, 40, 0.70)', width: 1.8, speed: 0.035, ampMultiplier: 0.7, freq: 0.045 },
        { color: 'rgba(33, 41, 56, 0.35)', width: 1.0, speed: 0.055, ampMultiplier: 0.4, freq: 0.025 }
      ];

      ribbons.forEach((ribbon) => {
        ctx.beginPath();
        ctx.strokeStyle = ribbon.color;
        ctx.lineWidth = ribbon.width;

        const points = 120;
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const normalizedX = (i / points) * Math.PI;
          const envelope = Math.sin(normalizedX); // Bell curve envelope

          let amplitude = 0;
          if (isRecording) {
            amplitude = (14 + micVolume * 55) * ribbon.ampMultiplier * envelope;
          } else if (isLoading) {
            amplitude = (8 + Math.sin(frame * 0.15) * 6) * ribbon.ampMultiplier * envelope;
          } else {
            amplitude = 5 * ribbon.ampMultiplier * envelope;
          }

          const y = midY + Math.sin(i * ribbon.freq + frame * ribbon.speed) * amplitude;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Baseline Hairline
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(223, 210, 188, 0.8)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRecording, isLoading]);

  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then((stream) => {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) return;
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        })
        .catch((e) => {
          console.log('Mic stream unavailable', e);
        });
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    }
  }, [isRecording]);

  const langLabelMap = {
    'gujarati': 'ગુજરાતીમાં બોલવા ક્લિક કરો',
    'hindi': 'हिंदी में बोलने के लिए क्लिक करें',
    'english': 'Click to Speak in English'
  };

  return (
    <div className="w-full bg-[#fdfcf9] border border-[#dfd2bc] rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Top Header Label */}
      <div className="w-full flex items-center justify-between border-b border-[#ede4d3] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a83226]" />
          <span className="font-serif text-sm font-bold tracking-wide text-[#12161f]">
            ધ્વનિ Acoustic Formant Wave
          </span>
        </div>
        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#ede4d3] text-[#12161f] font-semibold">
          {isRecording ? 'Listening...' : isLoading ? 'Searching...' : 'Ready'}
        </span>
      </div>

      {/* Real-time Canvas Waveform */}
      <div className="w-full h-24 flex items-center justify-center relative bg-[#f6f2ea] rounded-xl border border-[#ede4d3] overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={480} 
          height={96} 
          className="w-full h-full cursor-pointer"
          onClick={onToggleRecord}
        />
      </div>

      {/* Mic Action Bar */}
      <div className="w-full mt-3.5 pt-3 border-t border-[#ede4d3] flex items-center justify-between">
        <button
          onClick={onToggleRecord}
          className={`px-4 py-2 rounded-xl text-xs font-serif font-bold tracking-wide flex items-center gap-2.5 transition-all shadow-sm cursor-pointer ${
            isRecording
              ? 'bg-[#a83226] text-white shadow-md animate-pulse'
              : 'bg-[#ede4d3] hover:bg-[#dfd2bc] text-[#12161f] border border-[#cbbba0]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-ping' : 'bg-[#a83226]'}`} />
          <span>
            {isRecording ? 'Listening to voice...' : isLoading ? 'Processing...' : langLabelMap[language] || 'Click to Speak'}
          </span>
        </button>

        <span className="font-mono text-[11px] text-[#4a5568]">
          {isRecording ? 'Speaking...' : 'Click wave to speak'}
        </span>
      </div>
    </div>
  );
}
