// Tight public guardrails: per-IP daily message cap + a hard daily spend cap.
//
// MVP NOTE: counters are in-memory, so they reset on redeploy and are
// per-serverless-instance on Vercel. Good enough until real traffic appears;
// swap the Maps for Upstash Redis / Vercel KV before promoting the site.

const PUBLIC_MSGS_PER_IP_PER_DAY = 10;
const DAILY_BUDGET_USD = Number(process.env.DAILY_BUDGET_USD ?? "2");

// claude-sonnet-4-6 pricing, USD per token
const INPUT_PRICE = 3 / 1_000_000;
const OUTPUT_PRICE = 15 / 1_000_000;

const ipCounts = new Map<string, { day: string; count: number }>();
let spend = { day: "", usd: 0 };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function checkIpLimit(ip: string): boolean {
  const day = today();
  const entry = ipCounts.get(ip);
  if (!entry || entry.day !== day) {
    ipCounts.set(ip, { day, count: 1 });
    return true;
  }
  if (entry.count >= PUBLIC_MSGS_PER_IP_PER_DAY) return false;
  entry.count += 1;
  return true;
}

export function budgetExhausted(): boolean {
  return spend.day === today() && spend.usd >= DAILY_BUDGET_USD;
}

export function recordUsage(inputTokens: number, outputTokens: number): void {
  const day = today();
  if (spend.day !== day) spend = { day, usd: 0 };
  spend.usd += inputTokens * INPUT_PRICE + outputTokens * OUTPUT_PRICE;
}
