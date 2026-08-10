interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  unit?: string;
}

export default function ProgressRing({
  value,
  max,
  size = 160,
  strokeWidth = 14,
  color = '#58B47A',
  trackColor = '#E7E7E7',
  label,
  sublabel,
  unit = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference - pct * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-2xl lg:text-3xl font-bold text-text-primary">
            {label}
            {unit && <span className="text-sm font-medium text-text-secondary ml-0.5">{unit}</span>}
          </span>
        )}
        {sublabel && <span className="text-xs text-text-secondary mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
