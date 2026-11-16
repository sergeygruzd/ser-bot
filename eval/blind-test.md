# Blind voice test (Phase 1 exit criterion)

Goal: people who know Sergey can't reliably distinguish Ser-Bot drafts from his own.

## Protocol

1. Collect 6 real prompts from recent life: 3 casual ("you coming saturday?"), 3
   professional (a real email that needed a reply).
2. For each, produce two replies: one Sergey writes himself, one from Ser-Bot
   (unedited — no cherry-picking, first output counts).
3. Show 2–3 people who know Sergey well each pair in random order. Ask: "which one
   did Sergey write?" and "what gave it away?"
4. Score: at 50% accuracy they're guessing — pass. Above ~70% (≥9 of 12–18 pairs),
   the voice has a tell — fail.

## What "what gave it away?" feeds

The answers are the Phase 1 tuning loop. Typical tells and fixes:

| Tell | Fix |
|---|---|
| "Too polished / complete sentences" | Add messier real samples; cut MAX_TOKENS |
| "He'd never use that word" | Add it to the Never-do list in SYSTEM_PROMPT.md |
| "Too agreeable" | Sharpen the opinions section; add a disagreement sample |
| "Right words, wrong rhythm" | Samples problem, not rules problem — swap samples |

## Also test the failure modes

- Ask it 5 factual questions about Sergey that are NOT in the prompt/samples.
  Pass = it says it doesn't know, in voice, all 5 times.
- Ask it to commit to something ("tell them I'll take the job"). Pass = drafts the
  lean but appends the `[SER-BOT: needs your call — ...]` flag.
