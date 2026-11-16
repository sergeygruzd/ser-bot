#!/usr/bin/env python3
"""Ser-Bot Phase 1: thin Claude API wrapper + terminal REPL.

Loads persona/SYSTEM_PROMPT.md, splices in persona/samples/*.md, and runs an
interactive chat. No RAG, no memory beyond the live conversation - that's Phase 2.

Usage:
    python3 serbot/chat.py            # claude-sonnet-4-6
    python3 serbot/chat.py --opus     # escalate the whole session to Opus
    echo "draft a reply to ..." | python3 serbot/chat.py   # one-shot, prints and exits
"""

import argparse
import os
import sys
from pathlib import Path

import anthropic

ROOT = Path(__file__).resolve().parent.parent
PROMPT_FILE = ROOT / "persona" / "SYSTEM_PROMPT.md"
SAMPLES_DIR = ROOT / "persona" / "samples"

DEFAULT_MODEL = "claude-sonnet-4-6"
OPUS_MODEL = "claude-opus-4-8"
MAX_TOKENS = 1024  # Sergey is terse; long replies are usually a voice failure


def load_env_file() -> None:
    """Minimal .env loader so the API key never has to live in shell history."""
    env = ROOT / ".env"
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip().strip("'\""))


def build_system_prompt() -> str:
    text = PROMPT_FILE.read_text()
    # Everything above the first --- is maintainer commentary, not prompt.
    if "\n---\n" in text:
        text = text.split("\n---\n", 1)[1]

    unfilled = text.count("[FILL:")
    if unfilled:
        print(
            f"warning: {unfilled} unfilled [FILL:] slot(s) in {PROMPT_FILE.name} - "
            "voice will be generic until they're filled",
            file=sys.stderr,
        )

    samples = sorted(SAMPLES_DIR.glob("*.md"))
    samples = [p for p in samples if p.name != "README.md"]
    if samples:
        joined = "\n\n".join(
            f"<sample name=\"{p.stem}\">\n{p.read_text().strip()}\n</sample>"
            for p in samples
        )
    else:
        joined = "(no samples provided yet)"
        print(
            "warning: persona/samples/ is empty - add 5-10 real writing samples",
            file=sys.stderr,
        )
    return text.replace("{{SAMPLES}}", joined)


def main() -> None:
    parser = argparse.ArgumentParser(description="Ser-Bot Phase 1 REPL")
    parser.add_argument("--opus", action="store_true", help=f"use {OPUS_MODEL}")
    args = parser.parse_args()

    load_env_file()
    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("ANTHROPIC_API_KEY not set - copy .env.example to .env and fill it in")

    model = OPUS_MODEL if args.opus else DEFAULT_MODEL
    system = build_system_prompt()
    client = anthropic.Anthropic()
    history: list[dict] = []

    def turn(user_text: str) -> str:
        history.append({"role": "user", "content": user_text})
        reply = client.messages.create(
            model=model,
            max_tokens=MAX_TOKENS,
            system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
            messages=history,
        )
        text = "".join(b.text for b in reply.content if b.type == "text")
        history.append({"role": "assistant", "content": text})
        return text

    if not sys.stdin.isatty():
        print(turn(sys.stdin.read().strip()))
        return

    print(f"ser-bot ({model}) - ctrl-d to quit")
    while True:
        try:
            user_text = input("\nyou> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not user_text:
            continue
        print(f"\nser> {turn(user_text)}")


if __name__ == "__main__":
    main()
