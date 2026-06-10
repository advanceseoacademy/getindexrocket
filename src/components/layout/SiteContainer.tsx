type SiteContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "article";
};

export function SiteContainer({
  children,
  className = "",
  as: Tag = "div",
}: SiteContainerProps) {
  return <Tag className={`site-container ${className}`.trim()}>{children}</Tag>;
}
