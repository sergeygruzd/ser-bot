# Ser-Bot intake interview

Answer inline under each question — rough, unpolished answers are BETTER, because I'm
harvesting your voice as much as the facts. Skip anything you want; type answers in
chat or directly into this file, whichever is easier. One pass through this unblocks
the whole build (site + persona).

Already decided (no need to re-answer): Next.js on Vercel · full personal site
(About, Projects, Writing, CV + chat) · public clone gets bio/career/opinions/
personality and can take messages · private mode via single passcode · tight public
rate limits and spend cap · models: Sonnet 4.6 default, Opus for hard/private turns.

---

## A. Site basics

**A1. Name & domain.** Is the site "Ser-Bot", or sergeygruzd.com with the bot as a
feature? Do you already own a domain?

>

**A2. Languages.** English only, or English + Russian — for the site, the bot, or both?

>

**A3. Design taste.** Sites you want it to feel like? Minimal/brutalist, warm,
playful, dark dev-portfolio? Any colors you're drawn to for *yourself* (vs a client
brand)?

>

**A4. Existing content.** Current CV, project write-ups, photos, published writing I
can pull from — what exists and where does it live?

>

**A5. Primary audience.** Who do you most want this site to land with — recruiters,
collaborators, friends? Sets the tone of everything.

>

## B. Bio & identity

**B1.** Introduce yourself the way you would to someone interesting at a party — not
the LinkedIn version.

>

**B2.** What do you do for work right now, and the one-line history of how you got here?

>

**B3.** What are you working on or excited about at the moment — projects, ideas,
obsessions?

>

**B4.** What two or three facts would people who know you well mention first about you?

>

**B5. Off-limits.** What should the bot NEVER reveal or discuss, even in private mode —
topics, people, anything? (Becomes a hard rule in the prompt.)

>

## C. Opinions & takes

**C1.** Your strongest-held professional opinion — phrased the way you'd say it out
loud, not the diplomatic version.

>

**C2.** A contrarian take — something you believe that most of your field/peers don't.

>

**C3.** Something you're openly unsure or conflicted about. (The clone needs calibrated
uncertainty, not just confidence.)

>

**C4.** What do you have zero patience for — in work, in people, in tech?

>

**C5.** What do you rate that others overlook — tools, practices, people, places?

>

**C6.** Three values you actually make decisions by (not aspirational ones).

>

## D. Speech patterns & dos/don'ts

**D1.** Signature phrases, greetings, sign-offs, verbal tics you actually use. (The
spec already notes: terse, direct, ALL-CAPS emphasis — confirm and add specifics.)

>

**D2.** Profanity level and emoji policy — in casual vs professional contexts?

>

**D3.** Code-switching — when do you write in Russian vs English, and with whom?

>

**D4.** Words or registers you'd NEVER use — the instant "that's not Sergey" tells.

>

**D5.** How do you disagree with someone? How do you say no? (One real example of
each if you can remember one.)

>

**D6.** How does your texting differ from your email — length, capitalization,
punctuation, response speed persona?

>

## E. Voice samples (the highest-leverage section)

Collect 5–10 REAL things you wrote, verbatim — typos and all — into
`persona/samples/`, one file each (see the README there). Aim for range:

- [ ] a one/two-line message reply
- [ ] a longer opinionated take
- [ ] a casual message to a friend
- [ ] a professional email you actually sent
- [ ] you pushing back / disagreeing
- [ ] you saying no to something
- [ ] you explaining something technical
- [ ] (optional) a Russian-language sample if the bot will be bilingual

For replies, include what you were replying to as a quoted line, so the rhythm of the
exchange is visible.
