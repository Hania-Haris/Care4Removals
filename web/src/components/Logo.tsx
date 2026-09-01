// Care4Removals lockup — inline SVG mark (house roof + moving van) plus the
// wordmark. `tone` picks the palette: "onDark" for the header/footer,
// "onLight" for light surfaces (PDF header, etc.).

export default function Logo({
  tone = "onDark",
  className,
}: {
  tone?: "onDark" | "onLight";
  className?: string;
}) {
  const roof = tone === "onDark" ? "#ffffff" : "#0c1f38";
  const care = tone === "onDark" ? "#ffffff" : "#0c1f38";

  return (
    <span className={`c4r-logo${className ? ` ${className}` : ""}`}>
      <svg
        className="c4r-logo-mark"
        viewBox="0 0 44 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="c4r-mark" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#63d9f0" />
            <stop offset="1" stopColor="#11a6c7" />
          </linearGradient>
        </defs>

        {/* one shape: a house whose lower half is a moving van.
            roof + right wall flow straight into the van body. */}
        <path
          d="M6 15.5 L19 4 L25.5 9.7 V6 h3.2 V12.2 L31 14"
          stroke={roof}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <g fill="url(#c4r-mark)">
          {/* van box — sits directly under the roof apex */}
          <rect x="8" y="15" width="19" height="13.5" rx="2.5" />
          {/* cab */}
          <path d="M27 18.5 h4.4 a2 2 0 0 1 1.55 .74 L37 24 a2 2 0 0 1 .45 1.26 V27.5 a1 1 0 0 1-1 1 H27 Z" />
          {/* house window on the box */}
        </g>
        <rect
          x="12"
          y="18"
          width="6.5"
          height="6.5"
          rx="1"
          fill={tone === "onDark" ? "#0a1526" : "#ffffff"}
          opacity="0.9"
        />

        {/* wheels */}
        <circle cx="15" cy="30" r="3.1" fill={roof} />
        <circle cx="15" cy="30" r="1.3" fill="url(#c4r-mark)" />
        <circle cx="32" cy="30" r="3.1" fill={roof} />
        <circle cx="32" cy="30" r="1.3" fill="url(#c4r-mark)" />

        {/* motion lines */}
        <g stroke="url(#c4r-mark)" strokeWidth="2.4" strokeLinecap="round">
          <line x1="1.5" y1="19" x2="6" y2="19" />
          <line x1="0" y1="24" x2="5.5" y2="24" />
        </g>
      </svg>

      <span className="c4r-logo-word">
        <span style={{ color: care }}>care4</span>
        <span style={{ color: "#37c4e0" }}>removals</span>
      </span>
    </span>
  );
}
