"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { PREFECTURES } from "@/lib/regions";
import type { OrgFormData, Tag } from "@/types/org";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <div className="h-72 rounded-lg bg-stone-100" />,
});

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

type GeocodeCandidate = { label: string; lat: number; lng: number };

type Props = {
  tags: Tag[];
  initial: OrgFormData;
  submitLabel: string;
  onSubmit: (form: OrgFormData) => Promise<void>;
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-stone-600">
        {label}
        {required && <span className="ml-1 font-normal text-red-500">必須</span>}
      </span>
      {children}
    </label>
  );
}

export default function OrgForm({ tags, initial, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<OrgFormData>(initial);
  const [candidates, setCandidates] = useState<GeocodeCandidate[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof OrgFormData>(key: K, value: OrgFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleTag = (tagId: string) =>
    set(
      "tag_ids",
      form.tag_ids.includes(tagId)
        ? form.tag_ids.filter((id) => id !== tagId)
        : [...form.tag_ids, tagId]
    );

  const geocode = async () => {
    const query = `${form.prefecture}${form.city}${form.address}`.trim();
    if (!query) return;
    setGeocoding(true);
    setCandidates([]);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data: { candidates?: GeocodeCandidate[] } = await res.json();
      const list = data.candidates ?? [];
      setCandidates(list);
      if (list.length > 0) {
        setForm((prev) => ({ ...prev, lat: list[0].lat, lng: list[0].lng }));
      }
    } finally {
      setGeocoding(false);
    }
  };

  const submit = () => {
    setError(null);
    if (!form.name.trim() || !form.prefecture || !form.contact_email.trim()) {
      setError("団体名・都道府県・連絡先メールは必須です。");
      return;
    }
    startTransition(async () => {
      try {
        await onSubmit(form);
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました。");
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-stone-800">公開情報</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="団体名" required>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="絵文字アイコン">
            <input className={inputClass} value={form.emoji} onChange={(e) => set("emoji", e.target.value)} />
          </Field>
          <Field label="都道府県" required>
            <select
              className={inputClass}
              value={form.prefecture}
              onChange={(e) => set("prefecture", e.target.value)}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </Field>
          <Field label="市区町村">
            <input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="人数規模">
            <input
              className={inputClass}
              value={form.member_scale}
              placeholder="例: 30名規模"
              onChange={(e) => set("member_scale", e.target.value)}
            />
          </Field>
          <Field label="連携ステータス（公開バッジ・運営が付与）">
            <input
              className={inputClass}
              value={form.partnership_status}
              placeholder="例: 紹介可能 / 連携実績あり"
              onChange={(e) => set("partnership_status", e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="ひとこと（VOICE）">
            <input className={inputClass} value={form.voice} onChange={(e) => set("voice", e.target.value)} />
          </Field>
          <Field label="団体概要">
            <textarea
              className={inputClass}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
          <Field label="得意領域・専門性">
            <textarea
              className={inputClass}
              rows={2}
              value={form.specialties}
              onChange={(e) => set("specialties", e.target.value)}
            />
          </Field>
          <Field label="主な実績">
            <textarea
              className={inputClass}
              rows={2}
              value={form.achievements}
              onChange={(e) => set("achievements", e.target.value)}
            />
          </Field>
          <Field label="企業連携の可能性">
            <textarea
              className={inputClass}
              rows={2}
              value={form.corporate_note}
              onChange={(e) => set("corporate_note", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="ホームページURL">
              <input className={inputClass} value={form.website_url} onChange={(e) => set("website_url", e.target.value)} />
            </Field>
            <Field label="Instagram URL">
              <input className={inputClass} value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} />
            </Field>
            <Field label="SNS URL">
              <input className={inputClass} value={form.sns_url} onChange={(e) => set("sns_url", e.target.value)} />
            </Field>
          </div>
          <div>
            <span className="mb-1 block text-xs font-bold text-stone-600">タグ</span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    form.tag_ids.includes(tag.id)
                      ? "bg-brand-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-brand-100"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-stone-800">地図ピン位置</h2>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={geocode}
            disabled={geocoding}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {geocoding ? "検索中…" : "住所から位置を検索"}
          </button>
          <span className="text-xs text-stone-500">
            {form.lat != null && form.lng != null
              ? `緯度 ${form.lat} / 経度 ${form.lng}`
              : "未設定（地図をクリックしても設定できます）"}
          </span>
        </div>
        {candidates.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {candidates.map((c) => (
              <button
                key={`${c.lat}-${c.lng}`}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, lat: c.lat, lng: c.lng }))}
                className="rounded border border-stone-300 px-2 py-1 text-xs hover:bg-stone-100"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
        <MapPicker
          lat={form.lat}
          lng={form.lng}
          onPick={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))}
        />
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="mb-3 text-sm font-bold text-amber-800">非公開情報（公開ページには表示されません）</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="連絡先メール" required>
            <input className={inputClass} value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
          </Field>
          <Field label="担当者名">
            <input className={inputClass} value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
          </Field>
          <Field label="電話番号">
            <input className={inputClass} value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
          </Field>
          <Field label="番地等（非公開）">
            <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
        </div>
      </section>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className="w-full rounded-xl bg-brand-500 py-3 text-base font-bold text-white shadow-md transition hover:bg-brand-600 disabled:opacity-50"
      >
        {isPending ? "処理中…" : submitLabel}
      </button>
    </div>
  );
}
