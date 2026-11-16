# Ser-Bot — a personal voice-and-knowledge clone

An LLM-backed agent that communicates as Sergey — voice, bio, opinions, and verbal
style — grounded in his real documents, usable as a delegate that drafts and responds
on his behalf. Explicitly **not** a system that makes novel judgment calls; it
represents him in low-to-medium-stakes interactions where the cost of being slightly
off is low.

> **Status: work in progress.** The architecture, guardrails, chat API and website scaffold are built, and the site typechecks and builds (`npm run build`). The persona itself is still a template (`[FILL]` slots in `persona/SYSTEM_PROMPT.md`), so the clone doesn't speak as me yet. The personal corpus is gitignored and never committed.

## Why this scope

The interface (how I sound, what I know about myself) clones well. The engine (how I
reason in situations I've never described) does not, because I can't fully articulate
myself and the model fills gaps with its own priors. So the target is a convincing,
grounded *representative*, with a hard line at autonomous decision-making.

## Architecture

- **Runtime:** Claude API (`claude-sonnet-4-6` for cost/latency, escalate to Opus for
  harder turns).
- **Builder:** Claude Code to scaffold the wrapper, memory layer, and chat UI.
- **Persona:** a detailed system prompt — values, opinions, speech patterns (terse,
  direct, all-caps emphasis), dos/don'ts, plus 5–10 dialogue samples actually written
  by Sergey. See [`persona/`](persona/).
- **Grounding:** RAG over a corpus of real docs (resumes, writing, project notes,
  message exports). Corpus lives in [`corpus/`](corpus/) — gitignored, never leaves
  this machine.
- **Memory:** vector store + rolling conversation summary retrieved per turn.
- **Voice fidelity (later, optional):** fine-tune on a few thousand real messages once
  the corpus exists.

## Phases

1. **MVP (weekend):** persona prompt + a handful of writing samples in a thin API
   wrapper. Validate it sounds like me. ← *this repo's current state*
2. **Grounding (1–2 weeks of evenings):** add RAG over the document corpus + memory
   layer. It now answers factual questions about me correctly, not just stylistically.
3. **Delegate mode:** wire it to draft replies (email/messages) in my voice with a
   human-in-the-loop approve step. Never auto-sends.
4. **Voice fine-tune (optional):** if voice fidelity matters and the message corpus is
   large enough, fine-tune to kill the "polished LLM" tell.

## Success criteria

- **Blind test:** people who know me can't reliably distinguish its drafts from mine
  in casual/professional contexts. (See [`eval/blind-test.md`](eval/blind-test.md).)
- It answers factual questions about me from grounded docs, and says "I don't know"
  rather than confabulating when ungrounded.
- It stays in-voice across a long conversation without drifting back to generic model
  tone.

## Hard constraints

- **Never auto-sends** or commits to anything on my behalf — human approval on every
  outbound action.
- **Flags rather than fakes:** on novel high-stakes questions it defers instead of
  guessing my judgment.
- **Corpus stays private;** personal data never goes into URLs or third-party stores I
  don't control.

## Known limitation to design around

The better the voice, the more its judgment gaps hide behind it — so the build
deliberately confines it to representation, not decision-making. The deferral rules
are baked into the system prompt itself, not bolted on.

## The website (decided 2026-06-12)

The delivery surface is a full personal site (Next.js on Vercel) with the clone as
centerpiece. Two tiers:

- **Public:** anyone can chat with the clone — bio, career, opinions, personality —
  and leave a message for Sergey. Tight guardrails: ~10 msgs/day per IP, short
  replies, Sonnet only, hard daily spend cap ("clone is napping" when hit).
- **Private:** a single passcode (`PRIVATE_PASSCODE`) unlocks full-corpus answers and
  delegate drafting, with optional Opus escalation per request.

Sections: About · Projects · Writing · CV · chat. Site code lives in [`site/`](site/).

## Quickstart

**0. Answer [`INTERVIEW.md`](INTERVIEW.md)** — the persona prompt and all site copy
derive from it. `persona/SYSTEM_PROMPT.md` has `[FILL:]` slots until then.

**Website** (requires Node.js ≥ 20 — `brew install node`):

```sh
cd ser-bot/site
npm install
cp .env.example .env.local    # ANTHROPIC_API_KEY + PRIVATE_PASSCODE
npm run dev                   # http://localhost:3000
```

**Quick voice testing without the site** (Python REPL):

```sh
cd ser-bot
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 serbot/chat.py        # interactive; --opus to escalate
```

## Repo layout

```
INTERVIEW.md               intake questions - answering this unblocks everything
persona/SYSTEM_PROMPT.md   the persona prompt (structure done, [FILL] slots for Sergey)
persona/samples/           5-10 real dialogue/writing samples, one file each
corpus/                    Phase 2: private document corpus (gitignored)
site/                      Next.js personal site + two-tier chat API
  app/api/chat/route.ts    tiering, rate limit, spend cap, Claude call w/ caching
  lib/persona.ts           builds public/private system prompts from persona/
  lib/guardrails.ts        per-IP daily cap + daily budget (in-memory MVP)
serbot/chat.py             thin Python REPL sharing the same persona files
eval/blind-test.md         protocol for the blind voice test
```

Built by Sergey Gruzd with Claude Code (AI pair programming).
