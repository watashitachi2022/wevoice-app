import { createPublicClient } from "./supabase/public";
import type { PublicOrg, Tag } from "@/types/org";

// 公開団体の全件取得（タグ名を結合）。ISRページから呼ばれる。
export async function fetchPublishedOrgs(): Promise<PublicOrg[]> {
  const supabase = createPublicClient();
  const [orgsRes, linksRes] = await Promise.all([
    supabase.from("public_organizations").select("*").order("published_at", { ascending: false }),
    supabase.from("organization_tags").select("organization_id, tags(name, sort_order)"),
  ]);
  if (orgsRes.error) throw orgsRes.error;
  if (linksRes.error) throw linksRes.error;

  const tagMap = new Map<string, string[]>();
  for (const link of linksRes.data ?? []) {
    const tag = link.tags as unknown as { name: string } | null;
    if (!tag) continue;
    const list = tagMap.get(link.organization_id) ?? [];
    list.push(tag.name);
    tagMap.set(link.organization_id, list);
  }
  return (orgsRes.data ?? []).map((org) => ({
    ...org,
    tags: tagMap.get(org.id) ?? [],
  })) as PublicOrg[];
}

export async function fetchPublishedOrg(id: string): Promise<PublicOrg | null> {
  const supabase = createPublicClient();
  const { data: org, error } = await supabase
    .from("public_organizations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !org) return null;
  const { data: links } = await supabase
    .from("organization_tags")
    .select("tags(name)")
    .eq("organization_id", id);
  const tags = (links ?? [])
    .map((l) => (l.tags as unknown as { name: string } | null)?.name)
    .filter((n): n is string => Boolean(n));
  return { ...org, tags } as PublicOrg;
}

export async function fetchActiveTags(): Promise<Tag[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
