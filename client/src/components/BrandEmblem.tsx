import React from 'react';

interface BrandEmblemProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  layout?: 'horizontal' | 'vertical';
  subtitle?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  size = 'md',
  showText = true,
  layout = 'horizontal',
  subtitle,
  theme = 'light',
  className = '',
}) => {
  const sizeMap = {
    xs: { bulb: 24, font: 'text-sm', sub: 'text-[9px]' },
    sm: { bulb: 32, font: 'text-base', sub: 'text-[10px]' },
    md: { bulb: 44, font: 'text-xl', sub: 'text-xs' },
    lg: { bulb: 60, font: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm' },
    xl: { bulb: 80, font: 'text-3xl sm:text-4xl', sub: 'text-sm sm:text-base' },
    '2xl': { bulb: 110, font: 'text-4xl sm:text-5xl', sub: 'text-base sm:text-lg' },
  };

  const { bulb, font, sub } = sizeMap[size];

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subColor = theme === 'dark' ? 'text-cyan-400' : 'text-blue-700';

  return (
    <div
      className={`flex items-center ${
        layout === 'vertical' ? 'flex-col text-center gap-3' : 'gap-3.5'
      } ${className}`}
    >
      {/* Official Marephraem Ideasource Lightbulb Circuit Emblem */}
      <svg
        width={bulb}
        height={bulb * 1.15}
        viewBox="0 0 120 138"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105 filter drop-shadow-xs"
        aria-label="Marephraem Ideasource Emblem"
      >
        <defs>
          <linearGradient id={`gradOrange-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id={`gradBlue-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <filter id={`emblemGlow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" floodColor="#0284c7" />
          </filter>
        </defs>

        <g filter={`url(#emblemGlow-${size})`}>
          {/* ORANGE TOP-LEFT CIRCUIT HALF */}
          <path
            d="M 60 12 C 38 12 22 28 22 52 C 22 68 31 82 39 94 L 46 106"
            stroke={`url(#gradOrange-${size})`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Circuit tracks on left */}
          <path
            d="M 33 42 L 46 56 L 46 72"
            stroke={`url(#gradOrange-${size})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="46" cy="72" r="4.5" fill="#ea580c" />
          <circle cx="33" cy="42" r="4" fill="#fb923c" />

          <path
            d="M 56 22 L 48 30 L 48 50 L 38 60"
            stroke={`url(#gradOrange-${size})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="38" cy="60" r="4.5" fill="#ea580c" />
          <circle cx="56" cy="22" r="4" fill="#fb923c" />

          {/* Core diagonal orange trace */}
          <path
            d="M 58 40 L 58 66 L 49 76 L 49 94"
            stroke={`url(#gradOrange-${size})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="49" cy="94" r="4.5" fill="#ea580c" />

          {/* BLUE BOTTOM-RIGHT CIRCUIT HALF */}
          <path
            d="M 60 12 C 82 12 98 28 98 52 C 98 68 89 82 81 94 L 74 106"
            stroke={`url(#gradBlue-${size})`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Circuit tracks on right */}
          <path
            d="M 66 26 L 66 52 L 77 63 L 77 78"
            stroke={`url(#gradBlue-${size})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="66" cy="26" r="4" fill="#38bdf8" />
          <circle cx="77" cy="78" r="4.5" fill="#0284c7" />

          <path
            d="M 87 46 L 76 57 L 76 80 L 68 88"
            stroke={`url(#gradBlue-${size})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="87" cy="46" r="4" fill="#38bdf8" />
          <circle cx="68" cy="88" r="4.5" fill="#0284c7" />

          {/* Core bottom-right trace */}
          <path
            d="M 61 74 L 71 84 L 71 102"
            stroke={`url(#gradBlue-${size})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="61" cy="74" r="4" fill="#38bdf8" />
          <circle cx="71" cy="102" r="4.5" fill="#0284c7" />

          {/* BULB BASE (Thread rings + contact) */}
          <rect x="45" y="110" width="30" height="7.5" rx="3.75" fill={`url(#gradBlue-${size})`} />
          <rect x="48" y="120" width="24" height="6.5" rx="3.25" fill={`url(#gradBlue-${size})`} />
          <path d="M 53 129 Q 60 134 67 129 Z" fill="#0369a1" />
        </g>
      </svg>

      {/* Typography: Marephraem Ideasource */}
      {showText && (
        <div className={`flex flex-col ${layout === 'vertical' ? 'items-center' : 'items-start'}`}>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-sans font-bold tracking-tight ${textColor} ${font} leading-none`}
            >
              Marephraem
            </span>
            <span
              className={`font-sans font-extrabold tracking-tight ${
                theme === 'dark'
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-300 to-blue-400'
                  : 'text-blue-700'
              } ${font} leading-none`}
            >
              Ideasource
            </span>
          </div>

          {subtitle && (
            <div
              className={`font-sans font-medium tracking-wide ${subColor} ${sub} mt-1 flex items-center gap-1.5`}
            >
              <span>{subtitle}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
