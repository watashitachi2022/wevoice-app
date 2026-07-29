"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAuthClient, requireAdmin } from "@/lib/supabase/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { regionOfPrefecture } from "@/lib/regions";
import type { OrgFormData, OrgStatus } from "@/types/org";

// ---------- 認証 ----------

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=1");
  redirect("/admin/applications");
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- 共通 ----------

const nullable = (v: string) => (v.trim() === "" ? null : v.trim());

function orgRowFromForm(form: OrgFormData) {
  return {
    name: form.name.trim(),
    emoji: form.emoji.trim() || "🏘️",
    region: regionOfPrefecture(form.prefecture),
    prefecture: form.prefecture,
    city: nullable(form.city),
    address: nullable(form.address),
    lat: form.lat,
    lng: form.lng,
    voice: nullable(form.voice),
    description: nullable(form.description),
    specialties: nullable(form.specialties),
    achievements: nullable(form.achievements),
    corporate_note: nullable(form.corporate_note),
    member_scale: nullable(form.member_scale),
    partnership_status: nullable(form.partnership_status),
    website_url: nullable(form.website_url),
    instagram_url: nullable(form.instagram_url),
    sns_url: nullable(form.sns_url),
    contact_email: form.contact_email.trim(),
    contact_name: nullable(form.contact_name),
    contact_phone: nullable(form.contact_phone),
  };
}

function assertRequired(form: OrgFormData) {
  if (!form.name.trim() || !form.prefecture || !form.contact_email.trim()) {
    throw new Error("団体名・都道府県・連絡先メールは必須です");
  }
}

async function replaceTags(orgId: string, tagIds: string[]) {
  const supabase = createAdminClient();
  await supabase.from("organization_tags").delete().eq("organization_id", orgId);
  if (tagIds.length > 0) {
    const { error } = await supabase
      .from("organization_tags")
      .insert(tagIds.map((tagId) => ({ organization_id: orgId, tag_id: tagId })));
    if (error) throw error;
  }
}

function revalidatePublic(orgId?: string) {
  revalidatePath("/");
  if (orgId) revalidatePath(`/org/${orgId}`);
}

// ---------- 申請の承認・却下 ----------

export async function approveApplication(applicationId: string, form: OrgFormData) {
  const admin = await requireAdmin();
  assertRequired(form);
  const supabase = createAdminClient();

  const now = new Date().toISOString();
  const { data: org, error } = await supabase
    .from("organizations")
    .insert({
      ...orgRowFromForm(form),
      status: "published",
      last_confirmed_at: now,
      published_at: now,
    })
    .select("id")
    .single();
  if (error) throw error;

  await replaceTags(org.id, form.tag_ids);

  await supabase
    .from("applications")
    .update({
      status: "approved",
      organization_id: org.id,
      reviewed_by: admin.id,
      reviewed_at: now,
    })
    .eq("id", applicationId);

  // TODO(Phase 1後半): Resend導入後、承認通知メールをここで送信する
  revalidatePublic(org.id);
  redirect("/admin/applications");
}

export async function rejectApplication(applicationId: string, formData: FormData) {
  const admin = await requireAdmin();
  const note = String(formData.get("note") ?? "");
  const supabase = createAdminClient();
  await supabase
    .from("applications")
    .update({
      status: "rejected",
      note: note.trim() || null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);
  redirect("/admin/applications");
}

// ---------- 団体の編集・状態変更 ----------

export async function updateOrganization(orgId: string, form: OrgFormData) {
  await requireAdmin();
  assertRequired(form);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("organizations")
    .update(orgRowFromForm(form))
    .eq("id", orgId);
  if (error) throw error;
  await replaceTags(orgId, form.tag_ids);
  revalidatePublic(orgId);
  redirect("/admin/orgs");
}

export async function setOrgStatus(orgId: string, status: OrgStatus) {
  await requireAdmin();
  const supabase = createAdminClient();
  const patch: Record<string, unknown> = { status };
  if (status === "published") {
    patch.published_at = new Date().toISOString();
    patch.last_confirmed_at = new Date().toISOString();
  }
  const { error } = await supabase.from("organizations").update(patch).eq("id", orgId);
  if (error) throw error;
  revalidatePublic(orgId);
  revalidatePath("/admin/orgs");
}
