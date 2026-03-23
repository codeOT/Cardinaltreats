interface CashewSVGProps {
  color?: string;
  size?: number;
}

export function CashewSVG({ color = "#D97706", size = 100 }: CashewSVGProps){
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="72" rx="32" ry="18" fill={color} opacity="0.1" />
      <path
        d="M22 52 Q17 32 36 23 Q55 14 67 30 Q80 47 70 64 Q60 78 44 76 Q22 74 22 52Z"
        fill={color} opacity="0.92"
      />
      <path
        d="M22 52 Q17 32 36 23 Q55 14 67 30 Q80 47 70 64 Q60 78 44 76 Q22 74 22 52Z"
        stroke="white" strokeWidth="1" opacity="0.2" fill="none"
      />
      <path
        d="M32 43 Q42 33 56 37 Q65 41 63 53"
        stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"
      />
      <circle cx="37" cy="38" r="3" fill="white" opacity="0.3" />
      <path
        d="M44 76 Q41 86 47 91 Q53 96 57 90 Q61 83 53 79"
        fill={color} opacity="0.7"
      />
    </svg>
  );
}