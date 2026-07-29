import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveApplication, rejectApplication } from "@/app/admin/actions";
import OrgForm from "@/components/admin/OrgForm";
import type { Application, OrgFormData, Tag } from "@/types/org";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ApplicationReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [{ data: app }, { data: tags }] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).maybeSingle(),
    supabase.from("tags").select("*").order("sort_order"),
  ]);
  if (!app) notFound();
  const application = app as Application;

  if (application.status !== "submitted") {
    return (
      <div>
        <p className="text-sm text-stone-600">
          この申請は処理済みです（{application.status === "approved" ? "承認" : "却下"}）。
        </p>
        <Link href="/admin/applications" className="mt-4 inline-block text-sm text-brand-600 underline">
          ← 申請一覧にもどる
        </Link>
      </div>
    );
  }

  const p = application.payload as Partial<OrgFormData> & { tag_ids?: string[] };
  const initial: OrgFormData = {
    name: p.name ?? "",
    emoji: p.emoji ?? "🏘️",
    prefecture: p.prefecture ?? "",
    city: p.city ?? "",
    address: "",
    voice: p.voice ?? "",
    description: p.description ?? "",
    specialties: "",
    achievements: "",
    corporate_note: "",
    member_scale: p.member_scale ?? "",
    partnership_status: "",
    website_url: p.website_url ?? "",
    instagram_url: p.instagram_url ?? "",
    sns_url: p.sns_url ?? "",
    contact_email: p.contact_email ?? "",
    contact_name: p.contact_name ?? "",
    contact_phone: "",
    tag_ids: p.tag_ids ?? [],
    lat: null,
    lng: null,
  };

  const approveWithId = approveApplication.bind(null, application.id);
  const rejectWithId = rejectApplication.bind(null, application.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-stone-900">申請の審査</h1>
        <Link href="/admin/applications" className="text-sm text-brand-600 underline">
          ← 申請一覧にもどる
        </Link>
      </div>
      <p className="rounded-lg bg-brand-50 p-3 text-xs leading-relaxed text-brand-800">
        申請内容を確認・補完し、「住所から位置を検索」で地図ピンを設定してから承認してください。
        承認すると即時に公開ページへ掲載されます。
      </p>

      <OrgForm
        tags={(tags ?? []) as Tag[]}
        initial={initial}
        submitLabel="✅ 承認して掲載を開始する"
        onSubmit={approveWithId}
      />

      <form
        action={rejectWithId}
        className="rounded-xl border border-stone-200 bg-white p-4"
      >
        <h2 className="mb-2 text-sm font-bold text-stone-800">却下する場合</h2>
        <textarea
          name="note"
          rows={2}
          placeholder="却下理由（運営メモ・任意）"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          className="mt-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          この申請を却下する
        </button>
      </form>
    </div>
  );
}
