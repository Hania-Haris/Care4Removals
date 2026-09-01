// Small, consistent line-icon set (24px, 1.75 stroke, round caps) so the
// marketing pages stop using emoji/text glyphs in boxes.

type IconName =
  | "shield-check"
  | "box"
  | "tag"
  | "truck"
  | "route"
  | "home"
  | "sparkle"
  | "clock"
  | "phone"
  | "mail"
  | "arrow-right"
  | "check";

const paths: Record<IconName, React.ReactNode> = {
  "shield-check": (
    <>
      <path d="M12 3 4 6v6c0 5 3.4 7.7 8 9 4.6-1.3 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  box: (
    <>
      <path d="M3.3 7 12 12l8.7-5M12 12v9.5" />
      <path d="M4 7.3v9.4a1 1 0 0 0 .5.87l7 3.9a1 1 0 0 0 1 0l7-3.9a1 1 0 0 0 .5-.87V7.3a1 1 0 0 0-.5-.87l-7-3.9a1 1 0 0 0-1 0l-7 3.9A1 1 0 0 0 4 7.3Z" />
    </>
  ),
  tag: (
    <>
      <path d="M3.6 12.5 11 5a2 2 0 0 1 1.4-.6H19a1.5 1.5 0 0 1 1.5 1.5v6.6a2 2 0 0 1-.6 1.4l-7.5 7.5a1.6 1.6 0 0 1-2.3 0l-6-6a1.6 1.6 0 0 1 0-2.3Z" />
      <circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h10a1 1 0 0 1 1 1V16H3a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1Z" />
      <path d="M14 9h3.6a1 1 0 0 1 .82.43L21 13v3h-7V9Z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h6.5a3.5 3.5 0 0 0 0-7H9.5a3.5 3.5 0 0 1 0-7H16" strokeDasharray="0.1 3.2" />
    </>
  ),
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  sparkle: (
    <path d="M12 3v3m0 12v3M4.2 7.2l2.1 2.1M17.7 17.7l-2.1-2.1M3 12h3m12 0h3M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1M12 8.5 13 11l2.5 1-2.5 1-1 2.5-1-2.5L7.5 12 10 11l2-2.5Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  phone: (
    <path d="M6.5 4h2.6l1.3 3.3-1.7 1.2a11 11 0 0 0 5.6 5.6l1.2-1.7L19 15.9V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 7.2 2 2 0 0 1 6.5 4Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
};

export default function Icon({
  name,
  size = 22,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
