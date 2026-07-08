"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

type BlogRichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type CKEditorInstance = {
  destroy: () => void;
  setData: (data: string) => void;
  getData: () => string;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeAllListeners: () => void;
};

declare global {
  interface Window {
    CKEDITOR?: {
      basePath: string;
      replace: (element: string | HTMLTextAreaElement, config?: Record<string, unknown>) => CKEditorInstance;
    };
  }
}

const CKEDITOR_SCRIPT = "/ckeditor/ckeditor.js";

const EDITOR_CONFIG = {
  versionCheck: false,
  skin: "moono-lisa",
  toolbarCanCollapse: false,
  height: 420,
  removePlugins: "elementspath,exportpdf",
  extraPlugins: "tableresize,tabletools,pastefromword,pastetools",
  bodyClass: "blog-ck4-body",
  contentsCss: ["/ckeditor/contents.css", "/ckeditor/blog-admin-contents.css"],
  toolbar: [
    {
      name: "clipboard",
      items: ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "-", "Undo", "Redo"],
    },
    { name: "links", items: ["Link", "Unlink"] },
    { name: "insert", items: ["Table", "HorizontalRule"] },
    { name: "tools", items: ["Maximize", "Source"] },
    "/",
    {
      name: "basicstyles",
      items: ["Bold", "Italic", "Underline", "Strike", "RemoveFormat"],
    },
    {
      name: "paragraph",
      items: ["NumberedList", "BulletedList", "-", "Outdent", "Indent", "Blockquote"],
    },
    { name: "styles", items: ["Format"] },
  ],
  format_tags: "p;h2;h3",
  allowedContent: true,
  pasteFromWordRemoveFontStyles: false,
  pasteFromWordRemoveStyles: false,
  fillEmptyBlocks: false,
  tabSpaces: 4,
  resize_enabled: true,
};

function ensureCkeditorChromeCss() {
  if (typeof document === "undefined" || document.getElementById("blog-ck4-chrome-css")) return;
  const link = document.createElement("link");
  link.id = "blog-ck4-chrome-css";
  link.rel = "stylesheet";
  link.href = "/ckeditor/blog-admin-chrome.css";
  document.head.appendChild(link);
}

export function BlogRichEditor({ value, onChange }: BlogRichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<CKEditorInstance | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const textareaId = useId().replace(/:/g, "");
  const lastValue = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!scriptReady || !textareaRef.current || editorRef.current) return;

    if (window.CKEDITOR) {
      window.CKEDITOR.basePath = "/ckeditor/";
    }

    ensureCkeditorChromeCss();

    const instance = window.CKEDITOR!.replace(textareaRef.current, EDITOR_CONFIG);

    editorRef.current = instance;
    instance.setData(value || "");
    lastValue.current = value || "";

    instance.on("change", () => {
      const data = instance.getData();
      if (data !== lastValue.current) {
        lastValue.current = data;
        onChangeRef.current(data);
      }
    });

    instance.on("instanceReady", () => {
      setEditorReady(true);
    });

    return () => {
      instance.destroy();
      editorRef.current = null;
      setEditorReady(false);
    };
  }, [scriptReady]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !editorReady) return;
    if (value !== lastValue.current && value !== editor.getData()) {
      editor.setData(value);
      lastValue.current = value;
    }
  }, [value, editorReady]);

  return (
    <>
      <Script
        src={CKEDITOR_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />
      <div className="blog-rich-editor blog-rich-editor-ck4 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] shadow-[var(--shadow-sm)]">
        {!scriptReady ? (
          <div className="blog-editor-skeleton h-[420px] animate-pulse bg-[var(--bg3)]" />
        ) : (
          <textarea
            id={textareaId}
            ref={textareaRef}
            defaultValue={value}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--card-border)] bg-[var(--bg3)] px-4 py-2.5 text-xs text-[var(--muted)]">
          <span>
            <strong className="text-[var(--text)]">Table:</strong> toolbar icon or paste from Excel / Sheets / Word
          </span>
          <span className="hidden sm:inline">Right-click inside a table for row/column options</span>
        </div>
      </div>
    </>
  );
}
