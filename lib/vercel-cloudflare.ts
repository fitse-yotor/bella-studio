// Next.js-only adapter. Vite/Cloudflare continues using its native DB binding.
// All credentials stay inside the server bundle and must never use NEXT_PUBLIC_.
type QueryResult = { success: boolean; results: Record<string, unknown>[]; meta: { changes: number } };
class Statement {
  constructor(private sql: string, private params: unknown[] = []) {}
  bind(...params: unknown[]) { return new Statement(this.sql, params); }
  private async query(): Promise<QueryResult> {
    const account = process.env.CLOUDFLARE_ACCOUNT_ID;
    const database = process.env.CLOUDFLARE_D1_DATABASE_ID;
    const token = process.env.CLOUDFLARE_D1_API_TOKEN;
    if (!account || !database || !token) throw new Error('D1 configuration missing');
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(database)}/query`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: this.sql, params: this.params }), cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('D1 query unavailable');
    const payload = await response.json() as { success: boolean; result: QueryResult[] };
    if (!payload.success || !payload.result?.[0]?.success) throw new Error('D1 query failed');
    return payload.result[0];
  }
  async first() { return (await this.query()).results[0] ?? null; }
  async run() { return this.query(); }
}
export const env = {
  get DB() {
    return process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_D1_DATABASE_ID && process.env.CLOUDFLARE_D1_API_TOKEN
      ? { prepare: (sql: string) => new Statement(sql) } : undefined;
  },
};
