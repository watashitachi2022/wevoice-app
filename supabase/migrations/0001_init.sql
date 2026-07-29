-- We Voice 初期スキーマ（開発計画.md §6 準拠）
-- 方針: 行レベル(RLS) + 列レベル(GRANT) の二重防御。
--       書き込み・管理操作はすべて Server Action (secret key) 経由のため、
--       anon / authenticated には読み取り以外の権限を一切与えない。

create extension if not exists moddatetime with schema extensions;

-- ============================================================
-- ① 団体（公開情報）
-- ============================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '🏘️',
  region text not null,                  -- 地方ブロック（都道府県から自動導出: lib/regions.ts）
  prefecture text not null,
  city text,
  address text,                          -- 番地等（非公開）
  lat double precision,
  lng double precision,
  voice text,
  description text,
  specialties text,
  achievements text,
  corporate_note text,
  member_scale text,
  partnership_status text,
  website_url text,
  sns_url text,
  instagram_url text,
  contact_email text not null,           -- 非公開
  contact_name text,                     -- 非公開
  contact_phone text,                    -- 非公開
  status text not null default 'pending'
    check (status in ('pending', 'published', 'hidden', 'archived')),
  last_confirmed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function extensions.moddatetime(updated_at);

create index idx_organizations_status on public.organizations (status);
create index idx_organizations_region on public.organizations (region);

-- ============================================================
-- ② タグ
-- ============================================================
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.organization_tags (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (organization_id, tag_id)
);

create index idx_organization_tags_tag on public.organization_tags (tag_id);

-- ============================================================
-- ③ 非公開詳細情報
-- ============================================================
create table public.organization_private_details (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  structure text,
  target_audience text,
  challenges text,
  collab_intent text,
  support_needs text,
  internal_memo text,
  data_consent boolean not null default false,
  consent_at timestamptz
);

-- ============================================================
-- ④ 掲載申請
-- ============================================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  type text not null default 'new' check (type in ('new', 'update')),
  organization_id uuid references public.organizations (id) on delete set null,
  status text not null default 'submitted'
    check (status in ('submitted', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create index idx_applications_status on public.applications (status);

-- ============================================================
-- ⑤ 更新用マジックリンクトークン（有効期限72時間・使い切り）
-- ============================================================
create table public.org_edit_tokens (
  token uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  expires_at timestamptz not null default now() + interval '72 hours',
  used_at timestamptz
);

-- ============================================================
-- ⑥ 広告（Phase 2で本実装）
-- ============================================================
create table public.ads (
  id uuid primary key default gen_random_uuid(),
  advertiser_name text not null,
  image_path text,
  link_url text,
  placement text not null check (placement in ('sidebar', 'detail_panel')),
  starts_at date,
  ends_at date,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.ad_impressions (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads (id) on delete cascade,
  date date not null,
  view_count int not null default 0,
  click_count int not null default 0,
  unique (ad_id, date)
);

-- ============================================================
-- ⑦ 確認メールログ（Phase 2）confirm_token: ワンクリック継続用（30日）
-- ============================================================
create table public.confirmation_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  sent_at timestamptz not null default now(),
  confirmed_at timestamptz,
  method text,
  confirm_token uuid not null default gen_random_uuid(),
  token_expires_at timestamptz not null default now() + interval '30 days'
);

-- ============================================================
-- ⑧ 管理者
-- ============================================================
create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text not null default 'staff' check (role in ('owner', 'staff'))
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

-- ============================================================
-- 権限（セキュリティの要）
-- ============================================================
-- デフォルトGRANTを全て剥奪してから、公開に必要な最小権限のみ付与する
revoke all on all tables in schema public from anon, authenticated;

alter table public.organizations enable row level security;
alter table public.tags enable row level security;
alter table public.organization_tags enable row level security;
alter table public.organization_private_details enable row level security;
alter table public.applications enable row level security;
alter table public.org_edit_tokens enable row level security;
alter table public.ads enable row level security;
alter table public.ad_impressions enable row level security;
alter table public.confirmation_logs enable row level security;
alter table public.admin_users enable row level security;

-- 列レベル権限: organizations は公開列のみ SELECT 可
-- （contact_email / contact_name / contact_phone / address は GRANT 対象外）
grant select (
  id, name, emoji, region, prefecture, city, lat, lng,
  voice, description, specialties, achievements, corporate_note,
  member_scale, partnership_status, website_url, sns_url, instagram_url,
  status, last_confirmed_at, published_at
) on public.organizations to anon, authenticated;

grant select on public.tags to anon, authenticated;
grant select on public.organization_tags to anon, authenticated;

-- 行レベルポリシー
create policy "public read published organizations"
  on public.organizations for select
  to anon, authenticated
  using (status = 'published');

create policy "public read active tags"
  on public.tags for select
  to anon, authenticated
  using (is_active = true);

-- 非公開団体のタグ紐付けから団体の存在が漏れないようにする
create policy "public read tags of published organizations"
  on public.organization_tags for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.status = 'published'
    )
  );

-- その他のテーブルは anon / authenticated へのGRANTなし＝構造的に到達不可。
-- 管理操作は Server Action (secret key / RLSバイパス) 経由のみ。

-- ============================================================
-- 公開ビュー（security_invoker 必須: 定義者権限によるRLSバイパスを防ぐ）
-- ============================================================
create view public.public_organizations
with (security_invoker = true) as
select
  id, name, emoji, region, prefecture, city, lat, lng,
  voice, description, specialties, achievements, corporate_note,
  member_scale, partnership_status, website_url, sns_url, instagram_url,
  last_confirmed_at, published_at
from public.organizations
where status = 'published';

grant select on public.public_organizations to anon, authenticated;
