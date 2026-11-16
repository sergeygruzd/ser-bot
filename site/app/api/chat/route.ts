import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/persona";
import { budgetExhausted, checkIpLimit, recordUsage } from "@/lib/guardrails";

export const runtime = "nodejs";

const PUBLIC_MODEL = "claude-sonnet-4-6";
const OPUS_MODEL = "claude-opus-4-8";
const PUBLIC_MAX_TOKENS = 300; // short replies by design on the public tier
const PRIVATE_MAX_TOKENS = 1024;

const client = new Anthropic();

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[]; escalate?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-20);
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "last message must be from user" }, { status: 400 });
  }

  const passcode = req.headers.get("x-serbot-passcode");
  const isPrivate =
    !!process.env.PRIVATE_PASSCODE && passcode === process.env.PRIVATE_PASSCODE;

  if (!isPrivate) {
    if (budgetExhausted()) {
      return NextResponse.json(
        { reply: "Sergey's clone is napping (daily budget hit). Try again tomorrow.", napping: true },
        { status: 200 },
      );
    }
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkIpLimit(ip)) {
      return NextResponse.json(
        { error: "Daily message limit reached. Come back tomorrow." },
        { status: 429 },
      );
    }
  }

  const model = isPrivate && body.escalate ? OPUS_MODEL : PUBLIC_MODEL;

  try {
    const response = await client.messages.create({
      model,
      max_tokens: isPrivate ? PRIVATE_MAX_TOKENS : PUBLIC_MAX_TOKENS,
      system: [
        {
          type: "text",
          text: buildSystemPrompt(isPrivate ? "private" : "public"),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    recordUsage(response.usage.input_tokens, response.usage.output_tokens);

    let reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Public visitors can leave word for Sergey; the model marks it [INBOX].
    const inboxMatch = reply.match(/\[INBOX\]\s*(.+)$/s);
    if (inboxMatch) {
      // MVP: serverless fs is ephemeral, so the inbox is the function log.
      // TODO(phase 3): persist to KV and surface in the private workbench.
      console.log("SER-BOT INBOX:", inboxMatch[1].trim());
      reply = reply.replace(/\[INBOX\][\s\S]*$/, "").trim() +
        "\n\nGot it - I'll pass that along.";
    }

    return NextResponse.json({ reply, tier: isPrivate ? "private" : "public", model });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Upstream rate limit - try again shortly." }, { status: 503 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API error", error.status, error.message);
      return NextResponse.json({ error: "Model call failed." }, { status: 502 });
    }
    throw error;
  }
}
