// Hero "A → B" moving-journey illustration. Fully inline SVG so it stays
// crisp at any size, themes with the brand palette, and adds no network
// request. The route dashes animate (disabled under reduced-motion via
// refresh.css).

function House({
  x,
  doorColor,
  greenery,
}: {
  x: number;
  doorColor: string;
  greenery: "cool" | "warm";
}) {
  return (
    <g transform={`translate(${x} 96)`}>
      {/* ground shadow */}
      <ellipse cx="44" cy="104" rx="52" ry="8" fill="#eaeef3" />

      {/* trees / bushes */}
      {greenery === "cool" ? (
        <>
          <path d="M2 78c0-11 7-18 12-18s12 7 12 18Z" fill="#cfe0f2" />
          <circle cx="14" cy="60" r="12" fill="#d3e2f4" />
          <rect x="12.5" y="66" width="3" height="34" rx="1.5" fill="#b9cce4" />
          <circle cx="86" cy="92" r="9" fill="#dbe7f5" />
        </>
      ) : (
        <>
          <circle cx="12" cy="62" r="12" fill="#bfe0c4" />
          <rect x="10.5" y="68" width="3" height="32" rx="1.5" fill="#9fcea8" />
          <circle cx="86" cy="90" r="10" fill="#c8e6cd" />
          <circle cx="95" cy="96" r="7" fill="#d7edda" />
        </>
      )}

      {/* body */}
      <rect
        x="16"
        y="46"
        width="60"
        height="54"
        rx="4"
        fill="#ffffff"
        stroke="#1e3a5f"
        strokeWidth="3.5"
      />
      {/* roof */}
      <path
        d="M6 50 L46 14 L86 50"
        fill="none"
        stroke="#1e3a5f"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* chimney */}
      <path
        d="M64 30 v-9 h8 v17"
        fill="none"
        stroke="#1e3a5f"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* door */}
      <rect x="27" y="68" width="16" height="32" rx="2" fill={doorColor} />
      <circle cx="39" cy="85" r="1.6" fill="#ffffff" />
      {/* window */}
      <rect
        x="52"
        y="60"
        width="17"
        height="17"
        rx="2"
        fill="#cdeaf4"
        stroke="#1e3a5f"
        strokeWidth="2.5"
      />
      <path d="M60.5 60v17M52 68.5h17" stroke="#1e3a5f" strokeWidth="1.6" />
    </g>
  );
}

function Pin({ x, color }: { x: number; color: string }) {
  return (
    <g transform={`translate(${x} 40)`}>
      <path
        d="M14 0a14 14 0 0 1 14 14c0 9.5-14 24-14 24S0 23.5 0 14A14 14 0 0 1 14 0Z"
        fill={color}
      />
      <circle cx="14" cy="14" r="5.2" fill="#ffffff" />
      <ellipse cx="14" cy="45" rx="7" ry="2.4" fill="rgba(15,23,42,0.12)" />
    </g>
  );
}

export default function HeroIllustration() {
  return (
    <div className="hero-illustration" aria-hidden="true">
      <svg viewBox="0 0 540 244" xmlns="http://www.w3.org/2000/svg" fill="none">
        <defs>
          <linearGradient id="c4r-van" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5911f" />
            <stop offset="1" stopColor="#e2660f" />
          </linearGradient>
          <radialGradient id="c4r-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f5911f" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f5911f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* faint skyline behind the journey */}
        <g fill="#eef3f8">
          <rect x="214" y="150" width="16" height="46" rx="2" />
          <rect x="236" y="136" width="13" height="60" rx="2" />
          <rect x="292" y="146" width="15" height="50" rx="2" />
          <rect x="312" y="128" width="12" height="68" rx="2" />
          <circle cx="266" cy="128" r="8" />
          <circle cx="276" cy="130" r="6" />
        </g>

        {/* ground */}
        <line x1="40" y1="208" x2="500" y2="208" stroke="#e2e8ef" strokeWidth="2.5" />
        <line
          x1="160"
          y1="220"
          x2="380"
          y2="220"
          stroke="#d3dbe5"
          strokeWidth="2.5"
          strokeDasharray="3 11"
          strokeLinecap="round"
        />

        {/* arc route — pin to pin */}
        <path
          className="hero-route"
          d="M84 88 C 180 10, 360 10, 456 88"
          stroke="#c6d1df"
          strokeWidth="2.5"
          strokeDasharray="2 11"
          strokeLinecap="round"
        />
        <path
          d="M448 76 l10 14 l-16 3"
          fill="none"
          stroke="#aebdc7"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <House x={34} doorColor="#17b0cf" greenery="cool" />
        <House x={412} doorColor="#e2660f" greenery="warm" />

        <Pin x={62} color="#1e3a5f" />
        <Pin x={440} color="#e2660f" />

        {/* van */}
        <g transform="translate(198 156)">
          <ellipse cx="66" cy="52" rx="64" ry="6" fill="rgba(15,23,42,0.08)" />
          {/* motion lines */}
          <g stroke="#f5911f" strokeWidth="3" strokeLinecap="round" opacity="0.75">
            <line x1="-26" y1="6" x2="-10" y2="6" />
            <line x1="-32" y1="18" x2="-8" y2="18" />
            <line x1="-24" y1="30" x2="-10" y2="30" />
          </g>
          {/* box body */}
          <rect x="0" y="0" width="94" height="44" rx="7" fill="url(#c4r-van)" />
          {/* cab */}
          <path
            d="M94 12 h16 a6 6 0 0 1 4.8 2.4 l10.5 14 a5 5 0 0 1 1 3 V40 a4 4 0 0 1-4 4 H94 Z"
            fill="url(#c4r-van)"
          />
          {/* windshield */}
          <path
            d="M99 17 h11 a3 3 0 0 1 2.4 1.2 l6.5 8.6 a2 2 0 0 1-1.6 3.2 H99 Z"
            fill="#bfe9f2"
          />
          {/* headlight */}
          <rect x="123" y="35" width="4.5" height="5" rx="1.5" fill="#ffd25e" />
          {/* side glyph: little house + box */}
          <g stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M26 24 L36 15 L46 24 M29 22 v11 h14 v-11" />
            <rect x="52" y="23" width="12" height="11" rx="1.5" />
            <path d="M52 27 h12 M58 23 v11" />
          </g>
          {/* wheels */}
          <circle cx="26" cy="46" r="10" fill="#14263d" />
          <circle cx="26" cy="46" r="3.6" fill="#61708a" />
          <circle cx="102" cy="46" r="10" fill="#14263d" />
          <circle cx="102" cy="46" r="3.6" fill="#61708a" />
        </g>
      </svg>

      <div className="hero-illustration-foot">
        <div className="hero-tag hero-tag-from">
          Your current home
          <span />
        </div>

        <div className="hero-progress" aria-hidden="true">
          <span className="hero-progress-dot is-done" />
          <span className="hero-progress-line" />
          <span className="hero-progress-dot is-active" />
          <span className="hero-progress-line" />
          <span className="hero-progress-dot" />
        </div>

        <div className="hero-tag hero-tag-to">
          Your new home
          <span />
        </div>
      </div>
    </div>
  );
}
