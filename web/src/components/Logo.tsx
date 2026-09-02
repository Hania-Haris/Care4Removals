import Image from "next/image";

// Care4Removals brand lockup. The artwork is white + cyan on transparency,
// so it's meant for dark surfaces (header, footer). `variant` picks the full
// lockup or just the icon mark.

export default function Logo({
  variant = "full",
  className,
  priority = false,
}: {
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
}) {
  if (variant === "mark") {
    return (
      <Image
        src="/assets/logo-mark.png"
        alt="Care4Removals"
        width={210}
        height={192}
        priority={priority}
        className={`c4r-logo-img c4r-logo-img--mark${className ? ` ${className}` : ""}`}
      />
    );
  }

  return (
    <Image
      src="/assets/logo-lockup.png"
      alt="Care4Removals"
      width={900}
      height={194}
      priority={priority}
      className={`c4r-logo-img${className ? ` ${className}` : ""}`}
    />
  );
}
