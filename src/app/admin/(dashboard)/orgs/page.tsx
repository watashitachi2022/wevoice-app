import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { setOrgStatus } from "@/app/admin/actions";
import type { AdminOrg, OrgStatus } from "@/types/org";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrgStatus, { label: string; class: string }> = {
  pending: { label: "承認待ち", class: "bg-amber-100 text-amber-700" },
  published: { label: "公開中", class: "bg-emerald-100 text-emerald-700" },
  hidden: { label: "非表示", class: "bg-stone-200 text-stone-500" },
  archived: { label: "アーカイブ", class: "bg-stone-200 text-stone-400" },
};

export default async function OrgsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .order("updated_at", { ascending: false });
  const orgs = (data ?? []) as AdminOrg[];

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-stone-900">団体一覧</h1>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
              <th className="px-4 py-2">団体名</th>
              <th className="px-4 py-2">地域</th>
              <th className="px-4 py-2">状態</th>
              <th className="px-4 py-2">最終確認</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => {
              const status = STATUS_LABEL[org.status];
              return (
                <tr key={org.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-stone-800">
                    <span className="mr-1">{org.emoji}</span>
                    {org.name}
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {org.prefecture} {org.city ?? ""}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-stone-500">
                    {org.last_confirmed_at
                      ? new Date(org.last_confirmed_at).toLocaleDateString("ja-JP")
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/orgs/${org.id}`}
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-50"
                      >
                        編集
                      </Link>
                      {org.status === "published" ? (
                        <form action={setOrgStatus.bind(null, org.id, "hidden")}>
                          <button
                            type="submit"
                            className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50"
                          >
                            非表示にする
                          </button>
                        </form>
                      ) : (
                        <form action={setOrgStatus.bind(null, org.id, "published")}>
                          <button
                            type="submit"
                            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50"
                          >
                            公開する
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-stone-400">
                  団体はまだ登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
