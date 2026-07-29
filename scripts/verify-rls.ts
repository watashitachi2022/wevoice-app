/**
 * RLS検証スクリプト（開発計画 §6-4）
 * Publishableキーだけで接続し、非公開データに構造的に到達できないことを確認する。
 * 実行: npm run verify:rls
 * スキーマ変更のたびに必ず実行すること。
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !publishableKey) {
  console.error("環境変数 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY が必要です");
  process.exit(1);
}

const anon = createClient(url, publishableKey, { auth: { persistSession: false } });

let failed = 0;

function ok(name: string) {
  console.log(`  ✅ ${name}`);
}
function ng(name: string, detail: string) {
  failed++;
  console.error(`  ❌ ${name} — ${detail}`);
}

async function main() {
  console.log("RLS検証を開始します（Publishableキーで接続）\n");

  // 1. 公開ビューは読める
  {
    const { data, error } = await anon.from("public_organizations").select("id, name").limit(1);
    if (error) ng("public_organizations が読める", error.message);
    else ok(`public_organizations が読める（${data.length}件確認）`);
  }

  // 2. 実テーブルの非公開列（contact_email）は読めない
  {
    const { error } = await anon.from("organizations").select("contact_email").limit(1);
    if (error) ok("organizations.contact_email は読めない（列権限で遮断）");
    else ng("organizations.contact_email は読めない", "非公開列が取得できてしまいました！");
  }

  // 3. address 列も読めない
  {
    const { error } = await anon.from("organizations").select("address").limit(1);
    if (error) ok("organizations.address は読めない");
    else ng("organizations.address は読めない", "非公開列が取得できてしまいました！");
  }

  // 4. published 以外の行は見えない（公開列のみのSELECTで status を確認）
  {
    const { data, error } = await anon.from("organizations").select("id, status");
    if (error) {
      ok(`organizations の行フィルタ確認はスキップ（${error.message}）`);
    } else {
      const bad = (data ?? []).filter((r) => r.status !== "published");
      if (bad.length === 0) ok("published 以外の行は見えない");
      else ng("published 以外の行は見えない", `${bad.length}件の非公開行が見えています！`);
    }
  }

  // 5. 非公開テーブルには一切アクセスできない
  for (const table of [
    "organization_private_details",
    "applications",
    "org_edit_tokens",
    "ads",
    "ad_impressions",
    "confirmation_logs",
    "admin_users",
  ]) {
    const { error } = await anon.from(table).select("*").limit(1);
    if (error) ok(`${table} は読めない`);
    else ng(`${table} は読めない`, "非公開テーブルにアクセスできてしまいました！");
  }

  // 6. anon からの書き込みは全て拒否される
  {
    const { error } = await anon
      .from("applications")
      .insert({ payload: { test: true }, type: "new" });
    if (error) ok("applications への直接INSERTは拒否される（Server Action経由のみ）");
    else ng("applications への直接INSERT拒否", "anonから直接INSERTできてしまいました！");
  }
  {
    const { error } = await anon
      .from("organizations")
      .update({ name: "hacked" })
      .eq("status", "published");
    if (error) ok("organizations への直接UPDATEは拒否される");
    else ng("organizations への直接UPDATE拒否", "anonから直接UPDATEできてしまいました！");
  }

  console.log(failed === 0 ? "\n🎉 全チェック合格" : `\n⚠️ ${failed}件の問題があります`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
