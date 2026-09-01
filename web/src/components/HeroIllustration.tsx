// Clean, proportioned "A → B" moving-journey illustration. Replaces the
// legacy CSS-drawn truck. Inline SVG, theme colours, one subtle animation
// on the route dashes (respects reduced-motion via CSS in refresh.css).

export default function HeroIllustration() {
  return (
    <div className="hero-illustration" aria-hidden="true">
      <svg viewBox="0 0 460 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="c4r-van" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f0870f" />
            <stop offset="1" stopColor="#e2660f" />
          </linearGradient>
        </defs>

        {/* soft ground */}
        <line
          x1="24"
          y1="238"
          x2="436"
          y2="238"
          stroke="#dbe4ee"
          strokeWidth="2"
        />

        {/* route */}
        <path
          className="hero-route"
          d="M70 238 C 150 238, 150 150, 230 150 S 310 238, 390 238"
          stroke="#c1cedd"
          strokeWidth="2.5"
          strokeDasharray="2 9"
          strokeLinecap="round"
        />

        {/* origin house */}
        <g transform="translate(36 150)">
          <path
            d="M0 30 L28 6 L56 30"
            stroke="#1f3a5c"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <rect x="6" y="30" width="44" height="42" rx="3" fill="#fff" stroke="#1f3a5c" strokeWidth="3" />
          <rect x="22" y="46" width="12" height="26" rx="2" fill="#17b0cf" />
        </g>

        {/* destination house */}
        <g transform="translate(368 150)">
          <path
            d="M0 30 L28 6 L56 30"
            stroke="#1f3a5c"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <rect x="6" y="30" width="44" height="42" rx="3" fill="#fff" stroke="#1f3a5c" strokeWidth="3" />
          <rect x="22" y="46" width="12" height="26" rx="2" fill="#e2660f" />
        </g>

        {/* van */}
        <g transform="translate(178 176)">
          <rect x="0" y="6" width="70" height="42" rx="7" fill="url(#c4r-van)" />
          <path
            d="M70 16 h13 a5 5 0 0 1 4 2 l9 13 a4 4 0 0 1 1 3 v10 a2 2 0 0 1-2 2 H70 Z"
            fill="url(#c4r-van)"
          />
          <rect x="74" y="20" width="14" height="11" rx="2" fill="#bfe9f2" />
          <rect x="10" y="16" width="30" height="3.5" rx="1.75" fill="rgba(255,255,255,0.5)" />
          <circle cx="20" cy="50" r="9" fill="#12233b" />
          <circle cx="20" cy="50" r="3.5" fill="#5b6b80" />
          <circle cx="80" cy="50" r="9" fill="#12233b" />
          <circle cx="80" cy="50" r="3.5" fill="#5b6b80" />
        </g>

        {/* pins */}
        <g transform="translate(52 96)">
          <path d="M12 0a12 12 0 0 1 12 12c0 8-12 20-12 20S0 20 0 12A12 12 0 0 1 12 0Z" fill="#1f3a5c" />
          <circle cx="12" cy="12" r="4.5" fill="#fff" />
        </g>
        <g transform="translate(384 96)">
          <path d="M12 0a12 12 0 0 1 12 12c0 8-12 20-12 20S0 20 0 12A12 12 0 0 1 12 0Z" fill="#e2660f" />
          <circle cx="12" cy="12" r="4.5" fill="#fff" />
        </g>
      </svg>

      <div className="hero-illustration-tags">
        <span className="hero-tag hero-tag-from">Your current home</span>
        <span className="hero-tag hero-tag-to">Your new home</span>
      </div>
    </div>
  );
}
