import React from 'react';

interface Conecta2LogoProps {
  className?: string;
  size?: number | string;
  withGlow?: boolean;
}

export const Conecta2Logo: React.FC<Conecta2LogoProps> = ({
  className = 'w-8 h-8',
  size,
  withGlow = false,
}) => {
  const sizeProps = size ? { width: size, height: size } : {};

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
        {...sizeProps}
      >
        <defs>
          {/* Top Arc Gradient: Royal to Electric Blue */}
          <linearGradient id="c2_top_arc" x1="120" y1="110" x2="380" y2="175" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A369D" />
            <stop offset="45%" stopColor="#0052D4" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>

          {/* Top-Right Cyan Tip Highlight */}
          <linearGradient id="c2_top_tip" x1="200" y1="120" x2="390" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0057E7" />
            <stop offset="60%" stopColor="#0099FF" />
            <stop offset="100%" stopColor="#00D2FF" />
          </linearGradient>

          {/* Left Arc Ribbon: Deep 3D Curve */}
          <linearGradient id="c2_left_curl" x1="70" y1="120" x2="190" y2="330" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0047BA" />
            <stop offset="35%" stopColor="#0A2870" />
            <stop offset="70%" stopColor="#081E56" />
            <stop offset="100%" stopColor="#003EAC" />
          </linearGradient>

          {/* Center Fold / Transition Shadow */}
          <linearGradient id="c2_center_fold" x1="150" y1="210" x2="340" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#091F5B" />
            <stop offset="40%" stopColor="#00359E" />
            <stop offset="85%" stopColor="#005FEA" />
            <stop offset="100%" stopColor="#0077FF" />
          </linearGradient>

          {/* Bottom Loop '2' Gradient: Electric Blue to Cyan */}
          <linearGradient id="c2_bottom_loop" x1="200" y1="190" x2="440" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#005BFF" />
            <stop offset="50%" stopColor="#0095FF" />
            <stop offset="100%" stopColor="#00C8FF" />
          </linearGradient>

          {/* Bottom Tail Fold & Glow */}
          <linearGradient id="c2_bottom_tail" x1="430" y1="310" x2="210" y2="415" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="40%" stopColor="#0080FF" />
            <stop offset="80%" stopColor="#00C4FF" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>

          {/* Inner Shadow for 3D realism */}
          <filter id="c2_shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#003399" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Ambient backlight glow if enabled */}
        {withGlow && (
          <circle cx="256" cy="256" r="180" fill="#0080FF" opacity="0.15" filter="blur(30px)" />
        )}

        {/* Group containing the Conecta2 intertwined ribbon mark */}
        <g id="conecta2_mark">
          {/* 1. Base Left Back Loop (C outer shell) */}
          <path
            d="M348 116H184C122.144 116 72 166.144 72 228C72 289.856 122.144 340 184 340H322C331.941 340 340 331.941 340 322C340 312.059 331.941 304 322 304H184C142.026 304 108 269.974 108 228C108 186.026 142.026 152 184 152H348C357.941 152 366 143.941 366 134C366 124.059 357.941 116 348 116Z"
            fill="url(#c2_left_curl)"
          />

          {/* 2. Top Forward Ribbon with Highlight (C top bar extending right) */}
          <path
            d="M178 116H330C366 116 398 134 402 165C406 195 380 220 348 220H200C168 220 138 202 138 178C138 143.753 160 116 178 116Z"
            fill="url(#c2_top_arc)"
          />

          {/* 2b. Top Cyan Crest Wave */}
          <path
            d="M260 116H340C375 116 404 136 408 168C380 180 320 180 270 176C242 173 216 160 216 142C216 127 236 116 260 116Z"
            fill="url(#c2_top_tip)"
          />

          {/* 3. Deep 3D Shadow Fold (under middle twist) */}
          <path
            d="M160 185C135 210 118 238 118 270C118 310 148 340 190 340H320C300 324 282 300 282 278C282 254 300 236 324 236H198C182 236 170 218 160 185Z"
            fill="url(#c2_center_fold)"
          />

          {/* 4. Bottom Right Loop / "2" Curve */}
          <path
            d="M210 236H332C393.856 236 444 286.144 444 348C444 409.856 393.856 460 332 460H164C154.059 460 146 451.941 146 442C146 432.059 154.059 424 164 424H332C373.974 424 408 389.974 408 348C408 306.026 373.974 272 332 272H210C200.059 272 192 263.941 192 254C192 244.059 200.059 236 210 236Z"
            fill="url(#c2_bottom_loop)"
          />

          {/* 5. Bottom Forward Ribbon & Cyan Tail Highlight */}
          <path
            d="M334 236C374 236 414 260 424 296C428 310 422 330 406 348C380 376 344 400 300 416C260 430 220 440 182 444C164 446 150 436 154 424C160 404 186 384 218 368C262 346 312 324 330 298C340 282 342 264 334 236Z"
            fill="url(#c2_bottom_tail)"
          />

          {/* 6. Glowing Cyan Front Wave of '2' */}
          <path
            d="M208 424H326C360 424 394 406 404 380C392 360 366 352 338 356C300 362 260 380 220 402C204 410 196 424 208 424Z"
            fill="#00D8FF"
            opacity="0.9"
          />

          {/* 7. Center Negative Space Circuit Cutout Highlight */}
          <path
            d="M206 254H330C338 254 344 260 344 268C344 276 338 282 330 282H206C198 282 192 276 192 268C192 260 198 254 206 254Z"
            fill="#FFFFFF"
            opacity="0.12"
          />
        </g>
      </svg>
    </div>
  );
};
