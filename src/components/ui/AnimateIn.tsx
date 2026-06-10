"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type RevealVariant = "fade-up" | "fade-in" | "slide-right" | "slide-left" | "scale";

const VARIANT_CLASS: Record<RevealVariant, string> = {
  "fade-up": "reveal-fade-up",
  "fade-in": "reveal-fade-in",
  "slide-right": "reveal-slide-right",
  "slide-left": "reveal-slide-left",
  scale: "reveal-scale",
};

type AnimateInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  as?: ElementType;
  style?: CSSProperties;
};

export function AnimateIn({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
  as: Component = "div",
  style,
}: AnimateInProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={`reveal ${VARIANT_CLASS[variant]} ${visible ? "reveal-visible" : ""} ${className}`.trim()}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}
