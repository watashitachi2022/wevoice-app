"use client";

import type { PublicOrg } from "@/types/org";

type Props = {
  org: PublicOrg;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function OrgCard({ org, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(org.id)}
      className={`w-full rounded-xl border bg-white p-3 text-left shadow-sm transition hover:shadow-md ${
        selected ? "border-brand-500 ring-2 ring-brand-200" : "border-stone-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{org.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-stone-800">{org.name}</p>
          <p className="text-xs text-stone-500">
            {org.prefecture}
            {org.city ? ` ${org.city}` : ""}
          </p>
        </div>
        {org.partnership_status && (
          <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
            {org.partnership_status}
          </span>
        )}
      </div>
      {org.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {org.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {org.voice && (
        <p className="mt-2 border-l-2 border-brand-300 pl-2 text-xs leading-relaxed text-stone-600">
          {org.voice}
        </p>
      )}
      {org.member_scale && (
        <p className="mt-2 text-[11px] text-stone-400">👥 {org.member_scale}</p>
      )}
    </button>
  );
}
