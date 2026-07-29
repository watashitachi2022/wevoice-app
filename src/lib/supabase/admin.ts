import "server-only";
import { createClient } from "@supabase/supabase-js";

// Secretキーを使う管理クライアント（RLSバイパス）。
// server-only によりクライアントバンドルへの混入はビルドエラーになる。
// 呼び出し側は必ず requireAdmin() で権限確認をしてから使うこと
// （例外: 申請フォームのINSERTのみ匿名から許可された唯一の書き込み経路）。
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}
