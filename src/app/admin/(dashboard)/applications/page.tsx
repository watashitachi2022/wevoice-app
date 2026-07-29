import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Application } from "@/types/org";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<Application["status"], { label: string; class: string }> = {
  submitted: { label: "審査待ち", class: "bg-amber-100 text-amber-700" },
  approved: { label: "承認済み", class: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "却下", class: "bg-stone-200 text-stone-500" },
};

export default async function ApplicationsPage() {
  const supabase = createAdminClient();
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (applications ?? []) as Application[];

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-stone-900">掲載申請一覧</h1>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
              <th className="px-4 py-2">団体名</th>
              <th className="px-4 py-2">地域</th>
              <th className="px-4 py-2">種別</th>
              <th className="px-4 py-2">状態</th>
              <th className="px-4 py-2">申請日時</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((app) => {
              const p = app.payload as { name?: string; prefecture?: string; city?: string };
              const status = STATUS_LABEL[app.status];
              return (
                <tr key={app.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-stone-800">{p.name ?? "（不明）"}</td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {p.prefecture ?? ""} {p.city ?? ""}
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {app.type === "new" ? "新規" : "更新"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-stone-500">
                    {new Date(app.created_at).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {app.status === "submitted" && (
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600"
                      >
                        審査する
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-stone-400">
                  申請はまだありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
