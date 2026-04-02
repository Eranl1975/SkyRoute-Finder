'use client';

interface AirplaneAnimatedProps {
  size?: number;
  animate?: 'hover' | 'fly' | 'pulse' | 'none';
  className?: string;
}

export function AirplaneAnimated({ size = 48, animate = 'hover', className = '' }: AirplaneAnimatedProps) {
  const animClass =
    animate === 'hover' ? '[animation:gentle-hover_3s_ease-in-out_infinite]' :
    animate === 'fly'   ? '[animation:fly-across_4s_ease-in-out_infinite]' :
    animate === 'pulse' ? '[animation:pulse-glow_2s_ease-in-out_infinite]' : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animClass} ${className}`}
      aria-hidden="true"
      role="img"
    >
      {/* Sky gradient background circle */}
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
        <linearGradient id="plane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
          <stop offset="50%" stopColor="#fb923c" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill="url(#bg-grad)" />

      {/* Contrail/trail */}
      <path d="M8 38 Q20 36 32 34" stroke="url(#trail-grad)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 41 Q22 39 30 37" stroke="url(#trail-grad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* Airplane body */}
      <g transform="translate(16, 20) rotate(-15, 16, 12)">
        {/* Fuselage */}
        <ellipse cx="16" cy="12" rx="14" ry="4" fill="url(#plane-grad)" />
        {/* Nose */}
        <path d="M30 12 L34 11 L30 10 Z" fill="#e0f2fe" />
        {/* Main wing */}
        <path d="M14 12 L20 4 L26 8 L18 12 Z" fill="white" opacity="0.95" />
        <path d="M14 12 L8 20 L14 18 L18 12 Z" fill="white" opacity="0.85" />
        {/* Tail wing */}
        <path d="M4 11 L2 7 L6 9 L6 11 Z" fill="white" opacity="0.9" />
        <path d="M4 13 L2 17 L6 15 L6 13 Z" fill="white" opacity="0.8" />
        {/* Window row */}
        <circle cx="22" cy="11" r="1.2" fill="#bae6fd" />
        <circle cx="19" cy="11" r="1.2" fill="#bae6fd" />
        <circle cx="16" cy="11" r="1.2" fill="#bae6fd" />
        {/* Orange accent stripe */}
        <path d="M6 13 L28 13" stroke="#f97316" strokeWidth="0.8" />
      </g>

      {/* Stars/sparkle accents */}
      <circle cx="52" cy="12" r="1.5" fill="#fef3c7" opacity="0.8" />
      <circle cx="10" cy="14" r="1" fill="#fef3c7" opacity="0.6" />
      <circle cx="55" cy="22" r="1" fill="#fef3c7" opacity="0.5" />
    </svg>
  );
}
