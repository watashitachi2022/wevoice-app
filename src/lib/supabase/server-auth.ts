import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "./admin";

// 管理者ログインのCookieセッション用クライアント（Supabase Auth）
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からの呼び出しでは set できない（middleware/Action側で処理）
          }
        },
      },
    }
  );
}

export type AdminUser = { id: string; email: string; name: string | null; role: string };

// ログイン済み かつ admin_users に登録済み であることを確認する。
// 管理系 Server Action / 管理ページは必ずこれを通す。
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_users")
    .select("id, name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return { id: user.id, email: user.email ?? "", name: data.name, role: data.role };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) throw new Error("管理者権限がありません");
  return admin;
}
