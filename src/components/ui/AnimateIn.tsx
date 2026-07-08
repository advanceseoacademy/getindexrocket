import type { CSSProperties, ElementType, ReactNode } from "react";

type RevealVariant = "fade-up" | "fade-in" | "slide-right" | "slide-left" | "scale";

const VARIANT_CLASS: Record<RevealVariant, string> = {
  "fade-up": "reveal-css-fade-up",
  "fade-in": "reveal-css-fade-in",
  "slide-right": "reveal-css-slide-right",
  "slide-left": "reveal-css-slide-left",
  scale: "reveal-css-scale",
};

type AnimateInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  as?: ElementType;
  style?: CSSProperties;
};

/** CSS-only scroll reveal — no client JavaScript (better LCP/INP). */
export function AnimateIn({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
  as: Component = "div",
  style,
}: AnimateInProps) {
  return (
    <Component
      className={`reveal-css ${VARIANT_CLASS[variant]} ${className}`.trim()}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Component>
  );
}
