import fs from "fs";
import path from "path";

// Persona lives outside the site dir so the Python REPL and the site share one
// source of truth. Override with SERBOT_PERSONA_DIR when deploying.
const PERSONA_DIR =
  process.env.SERBOT_PERSONA_DIR ?? path.join(process.cwd(), "..", "persona");

const PUBLIC_ADDENDUM = `
# Public mode (this conversation is with an unauthenticated visitor)

- You may share: who you are, your career and projects, your opinions and takes,
  your interests and personality. Be yourself - that's the point of this site.
- You may NOT share: contact details beyond what the site already shows, anything
  about third parties, finances, addresses, schedules, or private documents.
- If the visitor wants to get a message to Sergey, collect it and end your reply
  with a line in exactly this form: [INBOX] <their message and how to reach them>
- You cannot make plans, commitments, or appointments for Sergey. Offer to take a
  message instead.
- Keep replies SHORT. This is a chat widget, not an essay.`;

const PRIVATE_ADDENDUM = `
# Private mode (this conversation is with Sergey himself)

- Full access: ground answers in everything you know from this prompt and any
  documents provided in the conversation.
- Delegate drafting is your main job here: when given an email/message to answer,
  draft the reply in Sergey's voice. Never claim it was sent - Sergey reviews and
  sends everything himself.
- Hard rules 2 and 3 (commitment flags, out-of-depth flags) still apply to drafts:
  mark the spots Sergey must decide.`;

let cached: { base: string; mtime: number } | null = null;

function loadBase(): string {
  const promptFile = path.join(PERSONA_DIR, "SYSTEM_PROMPT.md");
  const mtime = fs.statSync(promptFile).mtimeMs;
  if (cached && cached.mtime === mtime) return cached.base;

  let text = fs.readFileSync(promptFile, "utf8");
  // Everything above the first --- is maintainer commentary, not prompt.
  const sep = text.indexOf("\n---\n");
  if (sep !== -1) text = text.slice(sep + 5);

  const samplesDir = path.join(PERSONA_DIR, "samples");
  let samples = "(no samples provided yet)";
  if (fs.existsSync(samplesDir)) {
    const files = fs
      .readdirSync(samplesDir)
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .sort();
    if (files.length > 0) {
      samples = files
        .map((f) => {
          const body = fs.readFileSync(path.join(samplesDir, f), "utf8").trim();
          return `<sample name="${f.replace(/\.md$/, "")}">\n${body}\n</sample>`;
        })
        .join("\n\n");
    }
  }

  const base = text.replace("{{SAMPLES}}", samples);
  cached = { base, mtime };
  return base;
}

export function buildSystemPrompt(tier: "public" | "private"): string {
  return loadBase() + (tier === "public" ? PUBLIC_ADDENDUM : PRIVATE_ADDENDUM);
}

export function unfilledSlotCount(): number {
  return (loadBase().match(/\[FILL:/g) ?? []).length;
}
