import { createClient } from "@supabase/supabase-js";

// 公開データ読み取り専用クライアント（Publishableキー・RLS適用下）
// サーバーコンポーネント／ISRでの公開ページ生成に使う
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } }
  );
}
