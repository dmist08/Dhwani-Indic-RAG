import React from 'react';

export default function VectorSignature({ className = "" }) {
  return (
    <div className={`w-48 h-20 relative select-none ${className}`}>
      <svg
        viewBox="0 0 300 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M20 70 C40 20, 60 10, 70 60 C80 90, 95 30, 110 55 C125 75, 140 40, 155 65 C170 85, 190 20, 205 50 C220 75, 250 45, 280 60 M70 60 Q120 70 200 65"
          stroke="#C0FE04"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-1000"
          style={{
            strokeDasharray: 600,
            strokeDashoffset: 0
          }}
        />
      </svg>
      <span className="font-mono text-[10px] uppercase opacity-50 block text-right text-[#C0FE04]">
        Dharmik Mistry // Signature
      </span>
    </div>
  );
}
