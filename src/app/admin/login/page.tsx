import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server-auth";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "管理者ログイン" };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const admin = await getAdminUser();
  if (admin) redirect("/admin/applications");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-lg font-bold text-stone-900">
          🎙️ We Voice 管理画面
        </h1>
        <form action={signIn} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-stone-700">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-stone-700">
              パスワード
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
              メールアドレスまたはパスワードが正しくありません。
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
