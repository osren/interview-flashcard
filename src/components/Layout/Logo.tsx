/** Duolingo 风格吉祥物 Logo */
interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* 身体 */}
      <rect x="4" y="8" width="40" height="36" rx="14" fill="#58CC02" />
      <rect x="4" y="40" width="40" height="4" rx="2" fill="#46A302" />

      {/* 肚子高光 */}
      <ellipse cx="24" cy="30" rx="14" ry="11" fill="#89E219" opacity="0.5" />

      {/* 左眼 */}
      <ellipse cx="16" cy="22" rx="7" ry="8" fill="#FFFFFF" />
      <circle cx="17" cy="23" r="4" fill="#4B4B4B" />
      <circle cx="18.5" cy="21.5" r="1.5" fill="#FFFFFF" />

      {/* 右眼 */}
      <ellipse cx="32" cy="22" rx="7" ry="8" fill="#FFFFFF" />
      <circle cx="33" cy="23" r="4" fill="#4B4B4B" />
      <circle cx="34.5" cy="21.5" r="1.5" fill="#FFFFFF" />

      {/* 嘴巴 */}
      <path
        d="M18 32 Q24 36 30 32"
        stroke="#46A302"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 闪光卡片 */}
      <rect x="30" y="4" width="14" height="18" rx="3" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1.5" />
      <path d="M33 10 H41 M33 14 H39 M33 18 H41" stroke="#1CB0F6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 4 L39 1 L42 4" fill="#FFC800" />
    </svg>
  );
}
