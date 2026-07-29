"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, EMOJI_CHOICES, type ApplicationInput } from "@/lib/validation";
import { PREFECTURES } from "@/lib/regions";
import type { Tag } from "@/types/org";
import { submitApplication } from "./actions";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="mb-1 block text-sm font-bold text-stone-700">
      {children}
      {required && <span className="ml-1 text-xs font-normal text-red-500">必須</span>}
    </span>
  );
}

export default function ApplyForm({ tags }: { tags: Tag[] }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { tag_ids: [], emoji: "🏘️" },
  });
  const selectedEmoji = watch("emoji");

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const result = await submitApplication(data, honeypot);
    if (result && !result.ok) setServerError(result.message);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* honeypot: botだけが埋める不可視フィールド */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
        <label>
          このフィールドは空のままにしてください
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div>
        <Label required>団体名</Label>
        <input type="text" {...register("name")} className={inputClass} placeholder="例: ○○子育てサークル" />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <Label required>活動カテゴリ（1〜3つ）</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-sm has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:text-brand-700"
            >
              <input
                type="checkbox"
                value={tag.id}
                {...register("tag_ids")}
                className="accent-brand-500"
              />
              {tag.name}
            </label>
          ))}
        </div>
        {tags.length === 0 && (
          <p className="text-xs text-stone-400">カテゴリを読み込めませんでした。</p>
        )}
        {errors.tag_ids && <p className="mt-1 text-xs text-red-500">{errors.tag_ids.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>都道府県</Label>
          <select {...register("prefecture")} className={inputClass} defaultValue="">
            <option value="" disabled>
              選択してください
            </option>
            {PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
          {errors.prefecture && (
            <p className="mt-1 text-xs text-red-500">{errors.prefecture.message}</p>
          )}
        </div>
        <div>
          <Label required>市区町村</Label>
          <input type="text" {...register("city")} className={inputClass} placeholder="例: 〇〇市" />
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
        </div>
      </div>

      <div>
        <Label required>連絡先メールアドレス</Label>
        <input
          type="email"
          {...register("contact_email")}
          className={inputClass}
          placeholder="renraku@example.com"
        />
        <p className="mt-1 text-xs text-stone-400">公開されません。審査結果のご連絡に使用します。</p>
        {errors.contact_email && (
          <p className="mt-1 text-xs text-red-500">{errors.contact_email.message}</p>
        )}
      </div>

      <details className="rounded-xl border border-stone-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-stone-700">
          任意項目（あとから追加・変更できます）
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <Label>アイコン絵文字</Label>
            <div className="flex flex-wrap gap-1">
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setValue("emoji", emoji)}
                  className={`rounded-lg p-1.5 text-xl transition ${
                    selectedEmoji === emoji ? "bg-brand-100 ring-2 ring-brand-400" : "hover:bg-stone-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>ひとこと（VOICE）</Label>
            <input
              type="text"
              {...register("voice")}
              className={inputClass}
              placeholder="団体の想いをひとことで（100文字まで）"
            />
          </div>
          <div>
            <Label>団体概要</Label>
            <textarea {...register("description")} rows={4} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>人数規模</Label>
              <input type="text" {...register("member_scale")} className={inputClass} placeholder="例: 30名規模" />
            </div>
            <div>
              <Label>担当者名</Label>
              <input type="text" {...register("contact_name")} className={inputClass} />
            </div>
          </div>
          <div>
            <Label>ホームページURL</Label>
            <input type="url" {...register("website_url")} className={inputClass} placeholder="https://" />
            {errors.website_url && (
              <p className="mt-1 text-xs text-red-500">{errors.website_url.message}</p>
            )}
          </div>
          <div>
            <Label>Instagram URL</Label>
            <input type="url" {...register("instagram_url")} className={inputClass} placeholder="https://" />
          </div>
          <div>
            <Label>その他SNS URL</Label>
            <input type="url" {...register("sns_url")} className={inputClass} placeholder="https://" />
          </div>
        </div>
      </details>

      <p className="text-xs leading-relaxed text-stone-500">
        送信いただいた情報は
        <a href="/privacy" className="text-brand-600 underline">
          プライバシーポリシー
        </a>
        に基づいて取り扱います。
      </p>

      {serverError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="brand-gradient w-full rounded-full py-3 text-base font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? "送信中…" : "この内容で申請する"}
      </button>
    </form>
  );
}
