import Image from "next/image";
import Link from "next/link";
import { LOGO_ALT, LOGO_PATH } from "@/lib/brand";

const SIZES = {
  nav: { height: 64, width: 70 },
  footer: { height: 56, width: 62 },
  auth: { height: 72, width: 79 },
} as const;

type LogoProps = {
  variant?: keyof typeof SIZES;
  linked?: boolean;
  className?: string;
};

export function Logo({ variant = "nav", linked = true, className = "" }: LogoProps) {
  const { height, width } = SIZES[variant];

  const image = (
    <Image
      src={LOGO_PATH}
      alt={LOGO_ALT}
      width={width}
      height={height}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ maxHeight: height }}
      priority={variant === "nav"}
    />
  );

  if (!linked) return image;

  return (
    <Link href="/" className={`inline-flex shrink-0 items-center no-underline ${className}`}>
      {image}
    </Link>
  );
}
