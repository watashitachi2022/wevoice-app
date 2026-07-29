import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server-auth";
import { signOut } from "../actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/admin/applications" className="font-bold text-brand-600">
            🎙️ We Voice 管理
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/applications" className="text-stone-600 hover:text-brand-600">
              申請一覧
            </Link>
            <Link href="/admin/orgs" className="text-stone-600 hover:text-brand-600">
              団体一覧
            </Link>
            <Link href="/" className="text-stone-600 hover:text-brand-600" target="_blank">
              公開サイト ↗
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-stone-500">
            <span>{admin.email}</span>
            <form action={signOut}>
              <button type="submit" className="rounded border border-stone-300 px-2 py-1 hover:bg-stone-100">
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
