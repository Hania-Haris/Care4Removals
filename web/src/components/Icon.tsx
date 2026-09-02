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
  | "arrow-left"
  | "check"
  | "user"
  | "building"
  | "calendar"
  | "lock"
  | "file"
  | "map-pin"
  | "camera"
  | "message"
  | "heart";

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
  "arrow-left": <path d="M19 12H5M11 6l-6 6 6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M9 8h1.5M13.5 8H15M9 12h1.5M13.5 12H15M10 20.5v-4h4v4" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  file: (
    <>
      <path d="M7 3.5h7L18.5 8v11a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M13.5 3.5V8H18M8.5 13h7M8.5 16.5h7" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.6" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.5-2.5h7L18 8h2a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9.5A1.5 1.5 0 0 1 4 8Z" />
      <circle cx="12" cy="13" r="3.4" />
    </>
  ),
  message: (
    <>
      <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16H5A1.5 1.5 0 0 1 3.5 14.5V7A1.5 1.5 0 0 1 5 5.5Z" />
      <path d="M8 10h8M8 12.5h5" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.4-7-9.6A4.4 4.4 0 0 1 12 7.2 4.4 4.4 0 0 1 19 10.4c0 5.2-7 9.6-7 9.6Z" />
  ),
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
