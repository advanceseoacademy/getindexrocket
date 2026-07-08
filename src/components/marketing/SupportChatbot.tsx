"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { APP_NAME } from "@/lib/brand";
import { getChatbotReply } from "@/lib/chatbot-engine";
import { CHAT_BOT_NAME, CHAT_BOT_ROLE, CHAT_QUICK_PROMPTS, CHAT_WELCOME } from "@/lib/chatbot-knowledge";
import type { ChatLink } from "@/lib/chatbot-knowledge";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  links?: ChatLink[];
};

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-end gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--blue-12)] text-xs font-bold text-[var(--blue)]">
          {CHAT_BOT_NAME.charAt(0)}
        </div>
        <div className="rounded-2xl rounded-bl-md border border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-[var(--blue)] px-4 py-3 text-sm leading-relaxed text-white">
          <p>{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[92%] items-end gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--blue-12)] text-xs font-bold text-[var(--blue)]">
          {CHAT_BOT_NAME.charAt(0)}
        </div>
        <div className="min-w-0 rounded-2xl rounded-bl-md border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{message.text}</p>
          {message.links && message.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-2.5 py-1 text-xs font-medium text-[var(--blue)] no-underline hover:border-[var(--blue)]"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SupportChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const panelId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          text: CHAT_WELCOME,
          links: [
            { label: "Pricing", href: "/pricing" },
            { label: "Create account", href: "/register" },
          ],
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    if (open) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages, typing]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const reply = getChatbotReply(trimmed);

    window.setTimeout(() => {
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: reply.answer,
        links: reply.links,
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, reply.typingMs);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-3">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={`Chat with ${CHAT_BOT_NAME}`}
          className="flex h-[min(32rem,70vh)] w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--blue)] to-[var(--accent)] text-sm font-bold text-white">
              {CHAT_BOT_NAME.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{CHAT_BOT_NAME}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden />
                {CHAT_BOT_ROLE} · {APP_NAME}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)]"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {typing && <TypingIndicator />}
          </div>

          {messages.length <= 1 && !typing && (
            <div className="flex flex-wrap gap-2 border-t border-[var(--card-border)] px-4 py-3">
              {CHAT_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-full border border-[var(--card-border)] bg-[var(--bg3)] px-3 py-1 text-[11px] text-[var(--muted)] hover:border-[var(--blue)] hover:text-[var(--text)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex gap-2 border-t border-[var(--card-border)] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={typing}
              placeholder={`Message ${CHAT_BOT_NAME}…`}
              aria-label="Your message"
              className="min-w-0 flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--bg3)] px-3 py-2 text-sm outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-18)] disabled:opacity-60"
            />
            <button type="submit" disabled={typing || !input.trim()} className="btn btn-primary btn-sm shrink-0">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--blue)] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
        aria-label={open ? "Close chat" : `Chat with ${CHAT_BOT_NAME}`}
      >
        {open ? (
          <span className="text-2xl leading-none" aria-hidden>
            ×
          </span>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
        )}
      </button>
    </div>
  );
}
