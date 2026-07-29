// public_organizations ビューの行 + タグ名（アプリ内の公開団体の標準形）
export type PublicOrg = {
  id: string;
  name: string;
  emoji: string;
  region: string;
  prefecture: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  voice: string | null;
  description: string | null;
  specialties: string | null;
  achievements: string | null;
  corporate_note: string | null;
  member_scale: string | null;
  partnership_status: string | null;
  website_url: string | null;
  sns_url: string | null;
  instagram_url: string | null;
  last_confirmed_at: string | null;
  published_at: string | null;
  tags: string[];
};

export type OrgStatus = "pending" | "published" | "hidden" | "archived";

// organizations 実テーブルの行（管理画面用・非公開列を含む）
export type AdminOrg = Omit<PublicOrg, "tags"> & {
  address: string | null;
  contact_email: string;
  contact_name: string | null;
  contact_phone: string | null;
  status: OrgStatus;
  created_at: string;
  updated_at: string;
  tags?: string[];
};

export type Tag = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

// 管理画面の団体編集・承認フォームの入力値（Server Action と共有）
export type OrgFormData = {
  name: string;
  emoji: string;
  prefecture: string;
  city: string;
  address: string;
  voice: string;
  description: string;
  specialties: string;
  achievements: string;
  corporate_note: string;
  member_scale: string;
  partnership_status: string;
  website_url: string;
  instagram_url: string;
  sns_url: string;
  contact_email: string;
  contact_name: string;
  contact_phone: string;
  tag_ids: string[];
  lat: number | null;
  lng: number | null;
};

export type Application = {
  id: string;
  payload: Record<string, unknown>;
  type: "new" | "update";
  organization_id: string | null;
  status: "submitted" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  note: string | null;
  created_at: string;
};
