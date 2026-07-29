import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateOrganization } from "@/app/admin/actions";
import OrgForm from "@/components/admin/OrgForm";
import type { AdminOrg, OrgFormData, Tag } from "@/types/org";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function OrgEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [{ data: org }, { data: tags }, { data: links }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", id).maybeSingle(),
    supabase.from("tags").select("*").order("sort_order"),
    supabase.from("organization_tags").select("tag_id").eq("organization_id", id),
  ]);
  if (!org) notFound();
  const row = org as AdminOrg;

  const initial: OrgFormData = {
    name: row.name,
    emoji: row.emoji ?? "🏘️",
    prefecture: row.prefecture,
    city: row.city ?? "",
    address: row.address ?? "",
    voice: row.voice ?? "",
    description: row.description ?? "",
    specialties: row.specialties ?? "",
    achievements: row.achievements ?? "",
    corporate_note: row.corporate_note ?? "",
    member_scale: row.member_scale ?? "",
    partnership_status: row.partnership_status ?? "",
    website_url: row.website_url ?? "",
    instagram_url: row.instagram_url ?? "",
    sns_url: row.sns_url ?? "",
    contact_email: row.contact_email,
    contact_name: row.contact_name ?? "",
    contact_phone: row.contact_phone ?? "",
    tag_ids: (links ?? []).map((l) => l.tag_id),
    lat: row.lat,
    lng: row.lng,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-stone-900">
          団体の編集: {row.emoji} {row.name}
        </h1>
        <Link href="/admin/orgs" className="text-sm text-brand-600 underline">
          ← 団体一覧にもどる
        </Link>
      </div>
      <OrgForm
        tags={(tags ?? []) as Tag[]}
        initial={initial}
        submitLabel="変更を保存する"
        onSubmit={updateOrganization.bind(null, row.id)}
      />
    </div>
  );
}
