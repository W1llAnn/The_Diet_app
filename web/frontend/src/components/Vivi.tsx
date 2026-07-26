// Vivi - the friendly sprout mascot (SVG-based, gender-neutral, minimal)
interface ViviProps {
  size?: number;
  mood?: 'happy' | 'excited' | 'thinking' | 'proud' | 'sleeping' | 'waving' | 'love';
  className?: string;
  animate?: boolean;
}

export default function Vivi({ size = 80, mood = 'happy', className = '', animate = true }: ViviProps) {
  const s = size;

  const bodies: Record<string, React.ReactNode> = {
    happy: (
      <g>
        {/* Body */}
        <ellipse cx={s * 0.5} cy={s * 0.62} rx={s * 0.28} ry={s * 0.26} fill="#A8D5B5" />
        {/* Head */}
        <circle cx={s * 0.5} cy={s * 0.42} r={s * 0.22} fill="#C5E8D0" />
        {/* Cheeks */}
        <ellipse cx={s * 0.36} cy={s * 0.47} rx={s * 0.05} ry={s * 0.04} fill="#FFB3A0" opacity="0.6" />
        <ellipse cx={s * 0.64} cy={s * 0.47} rx={s * 0.05} ry={s * 0.04} fill="#FFB3A0" opacity="0.6" />
        {/* Eyes */}
        <ellipse cx={s * 0.42} cy={s * 0.41} rx={s * 0.04} ry={s * 0.05} fill="#2C2C2C" />
        <ellipse cx={s * 0.58} cy={s * 0.41} rx={s * 0.04} ry={s * 0.05} fill="#2C2C2C" />
        {/* Eye shine */}
        <circle cx={s * 0.44} cy={s * 0.39} r={s * 0.012} fill="white" />
        <circle cx={s * 0.60} cy={s * 0.39} r={s * 0.012} fill="white" />
        {/* Smile */}
        <path d={`M ${s*0.42} ${s*0.47} Q ${s*0.5} ${s*0.52} ${s*0.58} ${s*0.47}`} stroke="#2C2C2C" strokeWidth={s*0.02} fill="none" strokeLinecap="round" />
        {/* Arms */}
        <ellipse cx={s * 0.22} cy={s * 0.62} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(-15, ${s*0.22}, ${s*0.62})`} />
        <ellipse cx={s * 0.78} cy={s * 0.62} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(15, ${s*0.78}, ${s*0.62})`} />
        {/* Legs */}
        <ellipse cx={s * 0.42} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        <ellipse cx={s * 0.58} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        {/* Stem on head */}
        <line x1={s*0.5} y1={s*0.2} x2={s*0.5} y2={s*0.12} stroke="#6CC48A" strokeWidth={s*0.025} strokeLinecap="round" />
        {/* Leaves */}
        <ellipse cx={s * 0.44} cy={s * 0.1} rx={s * 0.1} ry={s * 0.055} fill="#58B47A" transform={`rotate(-20, ${s*0.44}, ${s*0.1})`} />
        <ellipse cx={s * 0.58} cy={s * 0.08} rx={s * 0.1} ry={s * 0.055} fill="#6CC48A" transform={`rotate(25, ${s*0.58}, ${s*0.08})`} />
      </g>
    ),
    waving: (
      <g>
        <ellipse cx={s * 0.5} cy={s * 0.62} rx={s * 0.28} ry={s * 0.26} fill="#A8D5B5" />
        <circle cx={s * 0.5} cy={s * 0.42} r={s * 0.22} fill="#C5E8D0" />
        <ellipse cx={s * 0.36} cy={s * 0.47} rx={s * 0.05} ry={s * 0.04} fill="#FFB3A0" opacity="0.6" />
        <ellipse cx={s * 0.64} cy={s * 0.47} rx={s * 0.05} ry={s * 0.04} fill="#FFB3A0" opacity="0.6" />
        <ellipse cx={s * 0.42} cy={s * 0.41} rx={s * 0.035} ry={s * 0.045} fill="#2C2C2C" />
        <ellipse cx={s * 0.58} cy={s * 0.41} rx={s * 0.035} ry={s * 0.045} fill="#2C2C2C" />
        <circle cx={s * 0.44} cy={s * 0.395} r={s * 0.01} fill="white" />
        <circle cx={s * 0.60} cy={s * 0.395} r={s * 0.01} fill="white" />
        <path d={`M ${s*0.42} ${s*0.47} Q ${s*0.5} ${s*0.53} ${s*0.58} ${s*0.47}`} stroke="#2C2C2C" strokeWidth={s*0.02} fill="none" strokeLinecap="round" />
        {/* Waving arm */}
        <ellipse cx={s * 0.22} cy={s * 0.62} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(-15, ${s*0.22}, ${s*0.62})`} />
        <ellipse cx={s * 0.82} cy={s * 0.48} rx={s * 0.06} ry={s * 0.12} fill="#A8D5B5" transform={`rotate(-30, ${s*0.82}, ${s*0.48})`} />
        <ellipse cx={s * 0.42} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        <ellipse cx={s * 0.58} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        <line x1={s*0.5} y1={s*0.2} x2={s*0.5} y2={s*0.12} stroke="#6CC48A" strokeWidth={s*0.025} strokeLinecap="round" />
        <ellipse cx={s * 0.44} cy={s * 0.1} rx={s * 0.1} ry={s * 0.055} fill="#58B47A" transform={`rotate(-20, ${s*0.44}, ${s*0.1})`} />
        <ellipse cx={s * 0.58} cy={s * 0.08} rx={s * 0.1} ry={s * 0.055} fill="#6CC48A" transform={`rotate(25, ${s*0.58}, ${s*0.08})`} />
      </g>
    ),
    excited: (
      <g>
        <ellipse cx={s * 0.5} cy={s * 0.62} rx={s * 0.28} ry={s * 0.26} fill="#A8D5B5" />
        <circle cx={s * 0.5} cy={s * 0.42} r={s * 0.22} fill="#C5E8D0" />
        <ellipse cx={s * 0.36} cy={s * 0.47} rx={s * 0.055} ry={s * 0.045} fill="#FFB3A0" opacity="0.7" />
        <ellipse cx={s * 0.64} cy={s * 0.47} rx={s * 0.055} ry={s * 0.045} fill="#FFB3A0" opacity="0.7" />
        {/* Wide eyes */}
        <circle cx={s * 0.42} cy={s * 0.41} r={s * 0.05} fill="#2C2C2C" />
        <circle cx={s * 0.58} cy={s * 0.41} r={s * 0.05} fill="#2C2C2C" />
        <circle cx={s * 0.44} cy={s * 0.385} r={s * 0.015} fill="white" />
        <circle cx={s * 0.60} cy={s * 0.385} r={s * 0.015} fill="white" />
        {/* Open mouth smile */}
        <path d={`M ${s*0.4} ${s*0.46} Q ${s*0.5} ${s*0.56} ${s*0.6} ${s*0.46}`} stroke="#2C2C2C" strokeWidth={s*0.025} fill="#FF9999" strokeLinecap="round" />
        {/* Arms raised */}
        <ellipse cx={s * 0.18} cy={s * 0.5} rx={s * 0.06} ry={s * 0.12} fill="#A8D5B5" transform={`rotate(-40, ${s*0.18}, ${s*0.5})`} />
        <ellipse cx={s * 0.82} cy={s * 0.5} rx={s * 0.06} ry={s * 0.12} fill="#A8D5B5" transform={`rotate(40, ${s*0.82}, ${s*0.5})`} />
        <ellipse cx={s * 0.42} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        <ellipse cx={s * 0.58} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        {/* Sparkles */}
        <text x={s*0.12} y={s*0.28} fontSize={s*0.1} fill="#FFD700">✦</text>
        <text x={s*0.76} y={s*0.24} fontSize={s*0.08} fill="#FF8A65">✦</text>
        <line x1={s*0.5} y1={s*0.2} x2={s*0.5} y2={s*0.1} stroke="#6CC48A" strokeWidth={s*0.025} strokeLinecap="round" />
        <ellipse cx={s * 0.44} cy={s * 0.08} rx={s * 0.11} ry={s * 0.06} fill="#58B47A" transform={`rotate(-20, ${s*0.44}, ${s*0.08})`} />
        <ellipse cx={s * 0.59} cy={s * 0.06} rx={s * 0.11} ry={s * 0.06} fill="#6CC48A" transform={`rotate(25, ${s*0.59}, ${s*0.06})`} />
      </g>
    ),
    thinking: (
      <g>
        <ellipse cx={s * 0.5} cy={s * 0.62} rx={s * 0.28} ry={s * 0.26} fill="#A8D5B5" />
        <circle cx={s * 0.5} cy={s * 0.42} r={s * 0.22} fill="#C5E8D0" />
        <ellipse cx={s * 0.36} cy={s * 0.47} rx={s * 0.04} ry={s * 0.035} fill="#FFB3A0" opacity="0.5" />
        <ellipse cx={s * 0.64} cy={s * 0.47} rx={s * 0.04} ry={s * 0.035} fill="#FFB3A0" opacity="0.5" />
        {/* One eye squinting */}
        <path d={`M ${s*0.38} ${s*0.41} Q ${s*0.42} ${s*0.39} ${s*0.46} ${s*0.41}`} stroke="#2C2C2C" strokeWidth={s*0.025} fill="none" strokeLinecap="round" />
        <ellipse cx={s * 0.58} cy={s * 0.41} rx={s * 0.04} ry={s * 0.05} fill="#2C2C2C" />
        <circle cx={s * 0.60} cy={s * 0.39} r={s * 0.012} fill="white" />
        {/* Neutral/thinking mouth */}
        <path d={`M ${s*0.43} ${s*0.48} Q ${s*0.5} ${s*0.5} ${s*0.57} ${s*0.48}`} stroke="#2C2C2C" strokeWidth={s*0.02} fill="none" strokeLinecap="round" />
        {/* Hand on chin */}
        <ellipse cx={s * 0.22} cy={s * 0.62} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(-15, ${s*0.22}, ${s*0.62})`} />
        <ellipse cx={s * 0.72} cy={s * 0.56} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(60, ${s*0.72}, ${s*0.56})`} />
        {/* Question dots */}
        <text x={s*0.7} y={s*0.2} fontSize={s*0.12} fill="#77B7F7">?</text>
        <ellipse cx={s * 0.42} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        <ellipse cx={s * 0.58} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        <line x1={s*0.5} y1={s*0.2} x2={s*0.5} y2={s*0.12} stroke="#6CC48A" strokeWidth={s*0.025} strokeLinecap="round" />
        <ellipse cx={s * 0.44} cy={s * 0.1} rx={s * 0.1} ry={s * 0.055} fill="#58B47A" transform={`rotate(-20, ${s*0.44}, ${s*0.1})`} />
        <ellipse cx={s * 0.58} cy={s * 0.08} rx={s * 0.1} ry={s * 0.055} fill="#6CC48A" transform={`rotate(25, ${s*0.58}, ${s*0.08})`} />
      </g>
    ),
    love: (
      <g>
        <ellipse cx={s * 0.5} cy={s * 0.62} rx={s * 0.28} ry={s * 0.26} fill="#A8D5B5" />
        <circle cx={s * 0.5} cy={s * 0.42} r={s * 0.22} fill="#C5E8D0" />
        <ellipse cx={s * 0.36} cy={s * 0.47} rx={s * 0.055} ry={s * 0.045} fill="#FFB3A0" opacity="0.8" />
        <ellipse cx={s * 0.64} cy={s * 0.47} rx={s * 0.055} ry={s * 0.045} fill="#FFB3A0" opacity="0.8" />
        {/* Heart eyes */}
        <text x={s*0.36} y={s*0.44} fontSize={s*0.1} fill="#FF6B8A" textAnchor="middle">♥</text>
        <text x={s*0.64} y={s*0.44} fontSize={s*0.1} fill="#FF6B8A" textAnchor="middle">♥</text>
        <path d={`M ${s*0.42} ${s*0.48} Q ${s*0.5} ${s*0.54} ${s*0.58} ${s*0.48}`} stroke="#2C2C2C" strokeWidth={s*0.025} fill="none" strokeLinecap="round" />
        <ellipse cx={s * 0.22} cy={s * 0.62} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(-15, ${s*0.22}, ${s*0.62})`} />
        <ellipse cx={s * 0.78} cy={s * 0.62} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(15, ${s*0.78}, ${s*0.62})`} />
        <ellipse cx={s * 0.42} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        <ellipse cx={s * 0.58} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        {/* Heart floats */}
        <text x={s*0.1} y={s*0.25} fontSize={s*0.09} fill="#FF8A65" opacity="0.6">♥</text>
        <text x={s*0.78} y={s*0.2} fontSize={s*0.07} fill="#FF6B8A" opacity="0.5">♥</text>
        <line x1={s*0.5} y1={s*0.2} x2={s*0.5} y2={s*0.12} stroke="#6CC48A" strokeWidth={s*0.025} strokeLinecap="round" />
        <ellipse cx={s * 0.44} cy={s * 0.1} rx={s * 0.1} ry={s * 0.055} fill="#58B47A" transform={`rotate(-20, ${s*0.44}, ${s*0.1})`} />
        <ellipse cx={s * 0.58} cy={s * 0.08} rx={s * 0.1} ry={s * 0.055} fill="#6CC48A" transform={`rotate(25, ${s*0.58}, ${s*0.08})`} />
      </g>
    ),
    proud: (
      <g>
        <ellipse cx={s * 0.5} cy={s * 0.62} rx={s * 0.28} ry={s * 0.26} fill="#A8D5B5" />
        <circle cx={s * 0.5} cy={s * 0.42} r={s * 0.22} fill="#C5E8D0" />
        <ellipse cx={s * 0.36} cy={s * 0.47} rx={s * 0.05} ry={s * 0.04} fill="#FFB3A0" opacity="0.6" />
        <ellipse cx={s * 0.64} cy={s * 0.47} rx={s * 0.05} ry={s * 0.04} fill="#FFB3A0" opacity="0.6" />
        {/* Closed happy eyes */}
        <path d={`M ${s*0.38} ${s*0.41} Q ${s*0.42} ${s*0.38} ${s*0.46} ${s*0.41}`} stroke="#2C2C2C" strokeWidth={s*0.025} fill="none" strokeLinecap="round" />
        <path d={`M ${s*0.54} ${s*0.41} Q ${s*0.58} ${s*0.38} ${s*0.62} ${s*0.41}`} stroke="#2C2C2C" strokeWidth={s*0.025} fill="none" strokeLinecap="round" />
        <path d={`M ${s*0.41} ${s*0.47} Q ${s*0.5} ${s*0.53} ${s*0.59} ${s*0.47}`} stroke="#2C2C2C" strokeWidth={s*0.022} fill="none" strokeLinecap="round" />
        {/* Thumbs up arm */}
        <ellipse cx={s * 0.22} cy={s * 0.62} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(-15, ${s*0.22}, ${s*0.62})`} />
        <ellipse cx={s * 0.78} cy={s * 0.52} rx={s * 0.065} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(-10, ${s*0.78}, ${s*0.52})`} />
        <text x={s*0.74} y={s*0.42} fontSize={s*0.1}>👍</text>
        <ellipse cx={s * 0.42} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        <ellipse cx={s * 0.58} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        {/* Star */}
        <text x={s*0.06} y={s*0.22} fontSize={s*0.1} fill="#FFD700">★</text>
        <line x1={s*0.5} y1={s*0.2} x2={s*0.5} y2={s*0.12} stroke="#6CC48A" strokeWidth={s*0.025} strokeLinecap="round" />
        <ellipse cx={s * 0.44} cy={s * 0.1} rx={s * 0.1} ry={s * 0.055} fill="#58B47A" transform={`rotate(-20, ${s*0.44}, ${s*0.1})`} />
        <ellipse cx={s * 0.58} cy={s * 0.08} rx={s * 0.1} ry={s * 0.055} fill="#6CC48A" transform={`rotate(25, ${s*0.58}, ${s*0.08})`} />
      </g>
    ),
    sleeping: (
      <g>
        <ellipse cx={s * 0.5} cy={s * 0.62} rx={s * 0.28} ry={s * 0.26} fill="#A8D5B5" />
        <circle cx={s * 0.5} cy={s * 0.44} r={s * 0.22} fill="#C5E8D0" />
        <ellipse cx={s * 0.36} cy={s * 0.49} rx={s * 0.045} ry={s * 0.035} fill="#FFB3A0" opacity="0.5" />
        <ellipse cx={s * 0.64} cy={s * 0.49} rx={s * 0.045} ry={s * 0.035} fill="#FFB3A0" opacity="0.5" />
        {/* Closed eyes */}
        <path d={`M ${s*0.38} ${s*0.43} Q ${s*0.42} ${s*0.41} ${s*0.46} ${s*0.43}`} stroke="#2C2C2C" strokeWidth={s*0.022} fill="none" strokeLinecap="round" />
        <path d={`M ${s*0.54} ${s*0.43} Q ${s*0.58} ${s*0.41} ${s*0.62} ${s*0.43}`} stroke="#2C2C2C" strokeWidth={s*0.022} fill="none" strokeLinecap="round" />
        {/* Small mouth */}
        <path d={`M ${s*0.46} ${s*0.5} Q ${s*0.5} ${s*0.52} ${s*0.54} ${s*0.5}`} stroke="#2C2C2C" strokeWidth={s*0.018} fill="none" strokeLinecap="round" />
        <ellipse cx={s * 0.22} cy={s * 0.62} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(-15, ${s*0.22}, ${s*0.62})`} />
        <ellipse cx={s * 0.78} cy={s * 0.62} rx={s * 0.06} ry={s * 0.1} fill="#A8D5B5" transform={`rotate(15, ${s*0.78}, ${s*0.62})`} />
        <ellipse cx={s * 0.42} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        <ellipse cx={s * 0.58} cy={s * 0.86} rx={s * 0.07} ry={s * 0.06} fill="#A8D5B5" />
        {/* ZZZ */}
        <text x={s*0.62} y={s*0.28} fontSize={s*0.09} fill="#A8D5B5" fontWeight="bold">z</text>
        <text x={s*0.70} y={s*0.2} fontSize={s*0.07} fill="#A8D5B5" fontWeight="bold">z</text>
        <text x={s*0.76} y={s*0.13} fontSize={s*0.055} fill="#A8D5B5" fontWeight="bold">z</text>
        <line x1={s*0.5} y1={s*0.22} x2={s*0.5} y2={s*0.14} stroke="#6CC48A" strokeWidth={s*0.025} strokeLinecap="round" />
        <ellipse cx={s * 0.44} cy={s * 0.12} rx={s * 0.1} ry={s * 0.055} fill="#58B47A" transform={`rotate(-20, ${s*0.44}, ${s*0.12})`} />
        <ellipse cx={s * 0.58} cy={s * 0.1} rx={s * 0.1} ry={s * 0.055} fill="#6CC48A" transform={`rotate(25, ${s*0.58}, ${s*0.1})`} />
      </g>
    ),
  };

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className={`${animate ? (mood === 'waving' ? 'vivi-wave' : 'vivi-float') : ''} ${className}`}
      aria-label="Виви, твой компаньон по питанию"
    >
      {bodies[mood] || bodies.happy}
    </svg>
  );
}
