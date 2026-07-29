"use client";

import Link from "next/link";
import type { PublicOrg } from "@/types/org";
import AdSlot from "./AdSlot";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 text-xs font-bold text-brand-600">{title}</h3>
      <div className="text-sm leading-relaxed text-stone-700">{children}</div>
    </section>
  );
}

type Props = {
  org: PublicOrg;
  onClose: () => void;
};

export default function DetailPanel({ org, onClose }: Props) {
  return (
    <aside className="fixed inset-0 z-40 flex flex-col bg-white lg:absolute lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[400px] lg:border-l lg:border-stone-200 lg:shadow-xl">
      <div className="flex items-start gap-3 border-b border-stone-100 p-4">
        <span className="text-4xl leading-none">{org.emoji}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-stone-900">{org.name}</h2>
          <p className="text-xs text-stone-500">
            {org.prefecture}
            {org.city ? ` ${org.city}` : ""}
            {org.member_scale ? `・${org.member_scale}` : ""}
          </p>
          {org.partnership_status && (
            <span className="mt-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
              {org.partnership_status}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {org.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {org.tags.map((tag) => (
              <span key={tag} className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                #{tag}
              </span>
            ))}
          </div>
        )}
        {org.voice && (
          <blockquote className="rounded-lg bg-brand-50 p-3 text-sm font-medium leading-relaxed text-brand-900">
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
          <p className="text-[11px] text-stone-400">
            最終更新: {new Date(org.last_confirmed_at).toLocaleDateString("ja-JP")}
          </p>
        )}

        <Link
          href={`/org/${org.id}`}
          className="block rounded-full border border-brand-300 py-2 text-center text-sm font-bold text-brand-600 transition hover:bg-brand-50"
        >
          この団体のページを開く（共有用）
        </Link>

        <AdSlot placement="detail_panel" />
      </div>
    </aside>
  );
}
