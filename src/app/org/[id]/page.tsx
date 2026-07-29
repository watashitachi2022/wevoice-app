import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPublishedOrg } from "@/lib/queries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";

// 承認/編集時に revalidatePath で更新。保険として1時間で再生成
export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const org = await fetchPublishedOrg(id);
  if (!org) return { title: "団体が見つかりません" };
  const description =
    org.voice ?? org.description ?? `${org.prefecture}で活動する地域団体です。`;
  return {
    title: `${org.emoji} ${org.name}（${org.prefecture}）`,
    description,
    openGraph: {
      title: `${org.emoji} ${org.name}`,
      description,
      type: "article",
    },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-bold text-brand-600">{title}</h2>
      <div className="text-sm leading-relaxed text-stone-700">{children}</div>
    </section>
  );
}

export default async function OrgPage({ params }: Props) {
  const { id } = await params;
  const org = await fetchPublishedOrg(id);
  if (!org) notFound();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6">
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          ← 地図・一覧にもどる
        </Link>

        <div className="flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-5">
          <span className="text-5xl leading-none">{org.emoji}</span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-stone-900">{org.name}</h1>
            <p className="mt-1 text-sm text-stone-500">
              📍 {org.prefecture}
              {org.city ? ` ${org.city}` : ""}
              {org.member_scale ? `・👥 ${org.member_scale}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {org.partnership_status && (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                  {org.partnership_status}
                </span>
              )}
              {org.tags.map((tag) => (
                <span key={tag} className="rounded bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {org.voice && (
          <blockquote className="rounded-xl bg-brand-50 p-4 text-sm font-medium leading-relaxed text-brand-900">
            🎙️ {org.voice}
          </blockquote>
        )}
        {org.description && <Section title="団体概要">{org.description}</Section>}
        {org.specialties && <Section title="得意領域・専門性">{org.specialties}</Section>}
        {org.achievements && <Section title="主な実績">{org.achievements}</Section>}
        {org.corporate_note && <Section title="企業連携の可能性">{org.corporate_note}</Section>}

        {(org.website_url || org.sns_url || org.instagram_url) && (
          <Section title="リンク">
            <ul className="space-y-1">
              {org.website_url && (
                <li>
                  <a href={org.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
                    🔗 ホームページ
                  </a>
                </li>
              )}
              {org.instagram_url && (
                <li>
                  <a href={org.instagram_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
                    📷 Instagram
                  </a>
                </li>
              )}
              {org.sns_url && (
                <li>
                  <a href={org.sns_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
                    💬 SNS
                  </a>
                </li>
              )}
            </ul>
          </Section>
        )}

        {org.last_confirmed_at && (
          <p className="text-xs text-stone-400">
            最終更新: {new Date(org.last_confirmed_at).toLocaleDateString("ja-JP")}
          </p>
        )}
        <AdSlot placement="detail_panel" />
      </main>
      <Footer />
    </div>
  );
}
