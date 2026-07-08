function isHtmlContent(content: string) {
  return /<[a-z][\s\S]*>/i.test(content.trim());
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function MarkdownContent({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);

  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="section-title mt-10 text-[1.875rem] md:text-[2.25rem]">
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="mt-8 text-[1.5rem] font-bold tracking-tight text-[var(--text)] md:text-[1.875rem]">
              {renderInline(trimmed.slice(4))}
            </h3>
          );
        }

        const lines = trimmed.split("\n");
        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(trimmed.replace(/\n/g, " "))}
          </p>
        );
      })}
    </>
  );
}

export function BlogContent({ content }: { content: string }) {
  if (isHtmlContent(content)) {
    return (
      <div
        className="blog-content-html space-y-5 text-[var(--muted)]"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="blog-content space-y-5 text-[var(--muted)]">
      <MarkdownContent content={content} />
    </div>
  );
}
