"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  function enablePrivateMode() {
    const code = window.prompt("Passcode:");
    if (!code) return;
    sessionStorage.setItem("serbot-passcode", code);
    setPrivateMode(true);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const passcode = sessionStorage.getItem("serbot-passcode");
      if (passcode) headers["x-serbot-passcode"] = passcode;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      const reply: string = res.ok
        ? data.reply
        : `(${data.error ?? "something went wrong"})`;
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "(network error)" }]);
    } finally {
      setBusy(false);
      queueMicrotask(() =>
        logRef.current?.scrollTo({ top: logRef.current.scrollHeight }),
      );
    }
  }

  return (
    <div className="chat">
      <div className="chat-log" ref={logRef}>
        {messages.length === 0 && (
          <div className="placeholder">
            This is Ser-Bot - a clone of Sergey, grounded in his real writing.
            Ask about his work, his takes, or leave him a message.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "user" ? "user" : "bot"}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          placeholder={busy ? "..." : "Say something"}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={busy}
        />
        <button onClick={send} disabled={busy || !input.trim()}>
          Send
        </button>
      </div>
      <div className="tier-note">
        {privateMode ? (
          "private mode"
        ) : (
          <button
            onClick={enablePrivateMode}
            style={{ all: "unset", cursor: "pointer", color: "inherit" }}
          >
            public mode - limited replies · sergey?
          </button>
        )}
      </div>
    </div>
  );
}
