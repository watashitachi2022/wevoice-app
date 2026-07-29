// 管理者アカウント作成スクリプト
// 使い方: node scripts/create-admin.mjs <email> <password> [表示名]
// Authユーザーを作成（メール確認済み扱い）し、admin_users に owner として登録する。
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const [email, password, name = "管理者"] = process.argv.slice(2);
if (!email || !password) {
  console.error("usage: node scripts/create-admin.mjs <email> <password> [表示名]");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } }
);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (error) {
  console.error("createUser failed:", error.message);
  process.exit(1);
}
const { error: e2 } = await supabase
  .from("admin_users")
  .insert({ id: data.user.id, name, role: "owner" });
if (e2) {
  console.error("admin_users insert failed:", e2.message);
  process.exit(1);
}
console.log("admin created:", data.user.id, email);
