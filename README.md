# ser-bot

wip. an ai version of me that can answer questions about me and draft replies in my voice. the rule is it drafts, it never sends anything or makes decisions for me. if something is high stakes it says "ask sergey" instead of guessing.

**status:** the chat api, guardrails and the site skeleton are done and build. the persona prompt is still a template (`persona/SYSTEM_PROMPT.md` has `[FILL]` slots) so it doesn't actually sound like me yet. my personal docs are gitignored and never committed.

## plan

1. persona prompt + some of my real writing samples, check if it sounds like me  <- here now
2. retrieval over my own docs (resume, notes, writing) so it gets facts right and says "i don't know" otherwise
3. draft mode for emails/messages with me approving every one
4. maybe fine tune on my messages later if the voice still sounds too "llm"

test for success: people who know me can't tell its drafts from mine (`eval/blind-test.md`).

## the site

next.js on vercel. public chat with tight limits (around 10 messages a day per ip, short answers, daily spend cap), plus a passcode for the private mode.

## run it

```sh
cd site
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY + PRIVATE_PASSCODE
npm run dev
```

or just the terminal version:

```sh
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 serbot/chat.py
```

`INTERVIEW.md` is the list of questions i need to answer to fill in the persona. built with claude code.
