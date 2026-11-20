import React from 'react';

export type LogoVariant = 'primary' | 'horizontal' | 'icon' | 'dark' | 'light';

interface DevSutraLogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export default function DevSutraLogo({
  variant = 'horizontal',
  className = '',
  size = 'md',
  showTagline = true,
}: DevSutraLogoProps) {
  // Dimensions map
  const iconSizes = {
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72,
  };

  const currentSize = iconSizes[size];
  const isDark = variant === 'dark';

  // Colors
  const maroonColor = isDark ? '#FFF8EC' : '#7B2635';
  const goldColor = '#C49A45';
  const saffronColor = '#D97724';
  const textColor = isDark ? '#FFF8EC' : '#382820';
  const subtextColor = isDark ? '#EDE0CB' : '#7B2635';

  // Lotus + Diya + Sacred Sutra Emblem SVG
  const Emblem = (
    <svg
      width={currentSize}
      height={currentSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="DevSutra Sacred Emblem"
    >
      <defs>
        {/* Sacred Gold Gradient */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFBC6C" />
          <stop offset="50%" stopColor="#C49A45" />
          <stop offset="100%" stopColor="#8F671E" />
        </linearGradient>

        {/* Diya Flame Gradient */}
        <linearGradient id="flameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#7B2635" />
          <stop offset="35%" stopColor="#D97724" />
          <stop offset="80%" stopColor="#F5B041" />
          <stop offset="100%" stopColor="#FFF8EC" />
        </linearGradient>

        {/* Sutra Aura Glow */}
        <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C49A45" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#C49A45" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Sacred Sutra (Thread / Circle of Eternity with Vedic Bindus) */}
      <circle cx="50" cy="50" r="47" stroke="url(#goldGrad)" strokeWidth="1.2" strokeDasharray="3 2" />
      <circle cx="50" cy="50" r="43.5" stroke={isDark ? '#FFF8EC' : '#7B2635'} strokeWidth="1" strokeOpacity="0.4" />
      
      {/* 8 Cardinal Sacred Dots (Ashta-Dala Bindus) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 50 + 43.5 * Math.cos(rad);
        const cy = 50 + 43.5 * Math.sin(rad);
        return <circle key={i} cx={cx} cy={cy} r="1.5" fill="url(#goldGrad)" />;
      })}

      {/* Radiant Background Aura */}
      <circle cx="50" cy="46" r="26" fill="url(#auraGlow)" />

      {/* Sacred Lotus Petals (Padma Base) */}
      {/* Left Outer Petal */}
      <path
        d="M26 62C22 53 26 42 35 39C36 48 31 57 26 62Z"
        fill="url(#goldGrad)"
        fillOpacity="0.85"
      />
      {/* Right Outer Petal */}
      <path
        d="M74 62C78 53 74 42 65 39C64 48 69 57 74 62Z"
        fill="url(#goldGrad)"
        fillOpacity="0.85"
      />
      {/* Left Mid Petal */}
      <path
        d="M33 66C30 55 37 43 45 42C43 52 38 61 33 66Z"
        fill={isDark ? '#FFF8EC' : '#7B2635'}
      />
      {/* Right Mid Petal */}
      <path
        d="M67 66C70 55 63 43 55 42C57 52 62 61 67 66Z"
        fill={isDark ? '#FFF8EC' : '#7B2635'}
      />

      {/* Traditional Diya Vessel (Deepa Base) */}
      <path
        d="M28 66C32 75 42 79 50 79C58 79 68 75 72 66C66 68 56 69 50 69C44 69 34 68 28 66Z"
        fill="url(#goldGrad)"
      />
      <ellipse cx="50" cy="66" rx="22" ry="3.5" fill="#652735" />
      <ellipse cx="50" cy="65.5" rx="19" ry="2.2" fill="#D97724" />

      {/* Sacred Akhand Jyoti (Flame of Devotion) */}
      <path
        d="M50 20C47 29 41 38 41 47C41 53 45 58 50 58C55 58 59 53 59 47C59 38 53 29 50 20Z"
        fill="url(#flameGrad)"
      />
      {/* Inner Divine Flame Core */}
      <path
        d="M50 32C48.5 37 45.5 42 45.5 48C45.5 51 47.5 54 50 54C52.5 54 54.5 51 54.5 48C54.5 42 51.5 37 50 32Z"
        fill="#FFF8EC"
      />

      {/* Sacred Bindu at Apex */}
      <circle cx="50" cy="15" r="2.2" fill="url(#goldGrad)" />
      
      {/* Base Ornament (Sutra Knot) */}
      <path
        d="M44 82C47 84 53 84 56 82C54 86 46 86 44 82Z"
        fill="url(#goldGrad)"
      />
      <circle cx="50" cy="85" r="1.5" fill="#D97724" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {Emblem}
      </div>
    );
  }

  if (variant === 'primary') {
    return (
      <div className={`flex flex-col items-center text-center group cursor-pointer ${className}`}>
        {Emblem}
        <div className="mt-2.5">
          <span
            className="font-brand tracking-wider font-bold block"
            style={{
              fontSize: size === 'xl' ? '2.5rem' : size === 'lg' ? '2rem' : '1.5rem',
              color: maroonColor,
              letterSpacing: '0.08em',
            }}
          >
            Puja<span style={{ color: goldColor }}>Connect</span>
          </span>
          {showTagline && (
            <p
              className="font-sans tracking-widest uppercase font-medium mt-0.5"
              style={{
                fontSize: size === 'xl' ? '0.75rem' : '0.65rem',
                color: subtextColor,
                letterSpacing: '0.22em',
              }}
            >
              Authentic Vedic Puja & Pandit Booking
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal Logo (Default for Navbars, Footers, and Headers)
  return (
    <div className={`flex items-center gap-3.5 group cursor-pointer ${className}`}>
      {Emblem}
      <div className="flex flex-col justify-center">
        <span
          className="font-brand font-bold leading-none tracking-tight flex items-baseline gap-0.5"
          style={{
            fontSize: size === 'xl' ? '2.2rem' : size === 'lg' ? '1.75rem' : size === 'md' ? '1.45rem' : '1.2rem',
            color: maroonColor,
            letterSpacing: '0.04em',
          }}
        >
          Puja<span style={{ color: goldColor }}>Connect</span>
        </span>
        {showTagline && (
          <span
            className="font-sans font-medium tracking-wider uppercase mt-1 leading-tight"
            style={{
              fontSize: size === 'xl' ? '0.68rem' : size === 'lg' ? '0.62rem' : '0.58rem',
              color: subtextColor,
              letterSpacing: '0.18em',
            }}
          >
            Authentic Vedic Puja & Pandit Booking
          </span>
        )}
      </div>
    </div>
  );
}
