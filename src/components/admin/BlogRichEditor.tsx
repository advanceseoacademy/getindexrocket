"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  Underline,
  Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

type BlogRichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const EDITOR_PLUGINS = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Heading,
  List,
  Link,
  BlockQuote,
  Undo,
];

export function BlogRichEditor({ value, onChange, placeholder }: BlogRichEditorProps) {
  const [ready, setReady] = useState(false);
  const lastValue = useRef(value);

  useEffect(() => {
    setReady(true);
  }, []);

  const config = useMemo(
    () => ({
      licenseKey: process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY ?? "GPL",
      plugins: EDITOR_PLUGINS,
      placeholder: placeholder ?? "Write your blog post…",
      toolbar: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "blockQuote",
        "link",
      ],
      heading: {
        options: [
          { model: "paragraph" as const, title: "Paragraph", class: "ck-heading_paragraph" },
          { model: "heading2" as const, view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
          { model: "heading3" as const, view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
        ],
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
      },
    }),
    [placeholder],
  );

  if (!ready) {
    return <div className="blog-editor-skeleton h-[360px] animate-pulse rounded-lg bg-[var(--bg3)]" />;
  }

  return (
    <div className="blog-rich-editor overflow-hidden rounded-lg border border-[var(--card-border)]">
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value}
        onReady={(editor) => {
          lastValue.current = editor.getData();
        }}
        onChange={(_event, editor) => {
          const data = editor.getData();
          lastValue.current = data;
          onChange(data);
        }}
      />
    </div>
  );
}
