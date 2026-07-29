"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { REGIONS } from "@/lib/regions";
import type { PublicOrg, Tag } from "@/types/org";
import Header from "./Header";
import Footer from "./Footer";
import OrgCard from "./OrgCard";
import DetailPanel from "./DetailPanel";
import AdSlot from "./AdSlot";

// Leaflet は SSR 不可のためクライアント側でのみ読み込む
const OrgMap = dynamic(() => import("./OrgMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-stone-100 text-sm text-stone-400">
      地図を読み込んでいます…
    </div>
  ),
});

type Props = {
  orgs: PublicOrg[];
  tags: Tag[];
};

export default function HomeClient({ orgs, tags }: Props) {
  const [keyword, setKeyword] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return orgs.filter((org) => {
      if (selectedRegion && org.region !== selectedRegion) return false;
      if (selectedTag && !org.tags.includes(selectedTag)) return false;
      if (kw) {
        const haystack = [
          org.name,
          org.voice,
          org.description,
          org.specialties,
          org.prefecture,
          org.city,
          ...org.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [orgs, keyword, selectedTag, selectedRegion]);

  const selectedOrg = filtered.find((o) => o.id === selectedId) ?? orgs.find((o) => o.id === selectedId) ?? null;
  const prefectureCount = new Set(orgs.map((o) => o.prefecture)).size;

  return (
    <div className="flex h-dvh flex-col">
      <Header orgCount={orgs.length} prefectureCount={prefectureCount} />

      <div className="relative flex min-h-0 flex-1">
        {/* サイドバー（モバイルでは「リスト」タブ時のみ表示） */}
        <div
          className={`w-full flex-col overflow-y-auto border-r border-stone-200 bg-white lg:flex lg:w-[380px] ${
            mobileView === "list" ? "flex" : "hidden"
          }`}
        >
          <div className="space-y-3 border-b border-stone-100 p-4">
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="団体名・キーワードで検索"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <div>
              <p className="mb-1.5 text-xs font-bold text-stone-500">カテゴリー</p>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  label="すべて"
                  active={selectedTag === null}
                  onClick={() => setSelectedTag(null)}
                />
                {tags.map((tag) => (
                  <FilterChip
                    key={tag.id}
                    label={tag.name}
                    active={selectedTag === tag.name}
                    onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold text-stone-500">エリア</p>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  label="全国"
                  active={selectedRegion === null}
                  onClick={() => setSelectedRegion(null)}
                />
                {REGIONS.map((region) => (
                  <FilterChip
                    key={region}
                    label={region}
                    active={selectedRegion === region}
                    onClick={() =>
                      setSelectedRegion(selectedRegion === region ? null : region)
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="px-4 pt-3 text-xs font-medium text-stone-500">
            {filtered.length}件の声が見つかりました
          </p>

          <div className="flex-1 space-y-3 p-4">
            {filtered.map((org) => (
              <OrgCard
                key={org.id}
                org={org}
                selected={org.id === selectedId}
                onSelect={setSelectedId}
              />
            ))}
            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-stone-400">
                {orgs.length === 0
                  ? "団体データを準備中です。もうしばらくお待ちください。"
                  : "条件に合う団体が見つかりませんでした。"}
              </p>
            )}
            <AdSlot placement="sidebar" />
          </div>
          <div className="lg:hidden">
            <Footer />
          </div>
        </div>

        {/* 地図（モバイルでは「地図」タブ時のみ表示） */}
        <div className={`relative flex-1 ${mobileView === "map" ? "block" : "hidden"} lg:block`}>
          <OrgMap orgs={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* 詳細パネル */}
        {selectedOrg && (
          <DetailPanel org={selectedOrg} onClose={() => setSelectedId(null)} />
        )}

        {/* モバイル: リスト/地図切替 */}
        <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 overflow-hidden rounded-full border border-stone-200 bg-white shadow-lg lg:hidden">
          <button
            type="button"
            onClick={() => setMobileView("list")}
            className={`px-5 py-2 text-sm font-bold ${
              mobileView === "list" ? "bg-brand-500 text-white" : "text-stone-600"
            }`}
          >
            📋 リスト
          </button>
          <button
            type="button"
            onClick={() => setMobileView("map")}
            className={`px-5 py-2 text-sm font-bold ${
              mobileView === "map" ? "bg-brand-500 text-white" : "text-stone-600"
            }`}
          >
            🗺️ 地図
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-brand-500 text-white shadow-sm"
          : "bg-stone-100 text-stone-600 hover:bg-brand-100"
      }`}
    >
      {label}
    </button>
  );
}
