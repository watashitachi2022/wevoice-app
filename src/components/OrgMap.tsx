"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MaplibreMap,
  Marker,
  NavigationControl,
  type LngLatBoundsLike,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PublicOrg } from "@/types/org";

const SEA_COLOR = "#d8eaf6";

// ベクター地図スタイル（OpenFreeMap: 無料・APIキー不要・商用可）
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

// 初期表示: 本州〜九州・北海道が画面サイズによらず収まるようにフィットさせる
const INITIAL_FIT_BOUNDS: LngLatBoundsLike = [
  [129, 30.8],
  [146.2, 45.8],
];

// パン可能な範囲（沖縄も含む・ゆとりを持たせる。きつく絞ると横長画面で
// 縦方向が入りきらなくなるため広めにしてある）
const MAX_BOUNDS: LngLatBoundsLike = [
  [110, 15],
  [165, 55],
];

// インセット（左上の小窓）: 沖縄・奄美エリア
const INSET_CENTER: [number, number] = [127.9, 26.5];
const INSET_ZOOM = 6.4;
// この緯度より南の団体はインセットにも表示する
const INSET_LAT_THRESHOLD = 29.5;

// このズームを超えたらインセットを隠す（拡大表示の邪魔にならないように）
const INSET_HIDE_ZOOM = 6.5;

// 日本語ラベル・海色・日本輪郭マスクを適用する共通処理
// マスクは scripts/build-mask.mjs で事前計算したグリッド分割ポリゴン群
// （巨大な「外周+穴数百個」ポリゴンは三角形分割が壊れ、陸地に切り込み状の
//   描画欠けが出るため、小さな単純ポリゴンの集合にしてある）
async function applyJapanStyle(map: MaplibreMap) {
  for (const layer of map.getStyle().layers) {
    if (layer.type !== "symbol") continue;
    if (!map.getLayoutProperty(layer.id, "text-field")) continue;
    map.setLayoutProperty(layer.id, "text-field", [
      "coalesce",
      ["get", "name:ja"],
      ["get", "name"],
    ]);
  }
  if (map.getLayer("water")) {
    map.setPaintProperty("water", "fill-color", SEA_COLOR);
  }

  try {
    const res = await fetch("/japan-mask.geojson");
    const mask = await res.json();
    map.addSource("japan-mask", {
      type: "geojson",
      // tolerance: 0 でズーム連動の自動間引きを無効化（間引きによる自己交差防止）
      tolerance: 0,
      data: mask,
    });
    map.addLayer({
      id: "japan-mask",
      type: "fill",
      source: "japan-mask",
      paint: { "fill-color": SEA_COLOR, "fill-opacity": 1, "fill-antialias": false },
    });
  } catch (e) {
    console.error("日本マスクデータの読み込みに失敗:", e);
  }
}

// ピンの配色パレット（団体IDから安定的に選ぶ）
const PIN_COLORS = [
  "#5b8def", // 青
  "#e77b6a", // コーラル
  "#3aa6a0", // ティール
  "#8a63c9", // 紫
  "#e8a33d", // オレンジ
  "#e36a9b", // ピンク
  "#66a96b", // 緑
  "#b8502f", // レンガ
  "#4f74c9", // 藍
  "#c2703e", // ブラウン
];

function pinColor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PIN_COLORS[hash % PIN_COLORS.length];
}

function createEmojiMarker(
  org: PublicOrg,
  map: MaplibreMap,
  onClick: (id: string) => void
) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "org-pin";
  el.style.setProperty("--pin-color", pinColor(org.id));
  el.setAttribute("aria-label", org.name);
  const bubble = document.createElement("span");
  bubble.className = "org-pin-bubble";
  bubble.textContent = org.emoji;
  el.appendChild(bubble);
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick(org.id);
  });
  return new Marker({ element: el, anchor: "bottom" })
    .setLngLat([org.lng!, org.lat!])
    .addTo(map);
}

const isOkinawaOrg = (org: PublicOrg) =>
  org.lat != null && org.lat < INSET_LAT_THRESHOLD;

type Props = {
  orgs: PublicOrg[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// MapLibre GL によるベクター地図（本体 + 沖縄インセット）
// インセットはショートカット: クリックすると本体地図が沖縄へ移動し、
// 以降は本体地図で沖縄を自由にズーム・パンできる
export default function OrgMap({ orgs, selectedId, onSelect }: Props) {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const insetContainerRef = useRef<HTMLDivElement>(null);
  const mainMapRef = useRef<MaplibreMap | null>(null);
  const insetMapRef = useRef<MaplibreMap | null>(null);
  const mainMarkersRef = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());
  const insetMarkersRef = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());
  const [insetVisible, setInsetVisible] = useState(true);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // 地図の初期化（マウント時に1回）
  useEffect(() => {
    if (!mainContainerRef.current || !insetContainerRef.current) return;

    const mainMap = new MaplibreMap({
      container: mainContainerRef.current,
      style: MAP_STYLE,
      bounds: INITIAL_FIT_BOUNDS,
      fitBoundsOptions: { padding: 24 },
      minZoom: 4,
      maxZoom: 17,
      maxBounds: MAX_BOUNDS,
      attributionControl: { compact: true },
    });
    mainMap.addControl(new NavigationControl({ showCompass: false }), "top-left");
    mainMap.touchPitch.disable();
    mainMap.dragRotate.disable();
    mainMap.on("load", () => applyJapanStyle(mainMap));
    // 全国を見渡すズームのときだけインセットを表示する
    mainMap.on("zoom", () => setInsetVisible(mainMap.getZoom() < INSET_HIDE_ZOOM));

    const insetMap = new MaplibreMap({
      container: insetContainerRef.current,
      style: MAP_STYLE,
      center: INSET_CENTER,
      zoom: INSET_ZOOM,
      interactive: false,
      attributionControl: false,
    });
    insetMap.on("load", () => applyJapanStyle(insetMap));

    mainMapRef.current = mainMap;
    insetMapRef.current = insetMap;
    if (process.env.NODE_ENV === "development") {
      (window as unknown as Record<string, unknown>).__wvMap = mainMap;
    }
    return () => {
      mainMarkersRef.current.forEach((m) => m.remove());
      mainMarkersRef.current.clear();
      insetMarkersRef.current.forEach((m) => m.remove());
      insetMarkersRef.current.clear();
      mainMap.remove();
      insetMap.remove();
      mainMapRef.current = null;
      insetMapRef.current = null;
    };
  }, []);

  // マーカーの同期（全団体を本体地図に置き、沖縄・奄美の団体はインセットにも置く）
  useEffect(() => {
    const mainMap = mainMapRef.current;
    const insetMap = insetMapRef.current;
    if (!mainMap || !insetMap) return;
    const wanted = new Set<string>();

    for (const org of orgs) {
      if (org.lat == null || org.lng == null) continue;
      wanted.add(org.id);
      if (!mainMarkersRef.current.has(org.id)) {
        mainMarkersRef.current.set(
          org.id,
          createEmojiMarker(org, mainMap, (id) => onSelectRef.current(id))
        );
      }
      if (isOkinawaOrg(org) && !insetMarkersRef.current.has(org.id)) {
        insetMarkersRef.current.set(
          org.id,
          createEmojiMarker(org, insetMap, (id) => onSelectRef.current(id))
        );
      }
    }
    for (const ref of [mainMarkersRef, insetMarkersRef]) {
      for (const [id, marker] of ref.current) {
        if (!wanted.has(id)) {
          marker.remove();
          ref.current.delete(id);
        }
      }
    }
  }, [orgs]);

  // 選択状態の反映（強調表示 + 本体地図の移動）
  useEffect(() => {
    const map = mainMapRef.current;
    if (!map) return;
    for (const ref of [mainMarkersRef, insetMarkersRef]) {
      for (const [id, marker] of ref.current) {
        marker.getElement().classList.toggle("selected", id === selectedId);
      }
    }
    const org = orgs.find((o) => o.id === selectedId);
    if (org?.lat != null && org?.lng != null) {
      map.flyTo({
        center: [org.lng, org.lat],
        zoom: Math.max(map.getZoom(), 9),
        duration: 700,
      });
    }
  }, [selectedId, orgs]);

  const flyToOkinawa = () => {
    mainMapRef.current?.flyTo({
      center: INSET_CENTER,
      zoom: 8,
      duration: 900,
    });
  };

  return (
    <div className="relative h-full w-full" style={{ background: SEA_COLOR }}>
      {/* MapLibreはコンテナのpositionをrelativeに上書きするため、absoluteではなくh-fullで広げる */}
      <div ref={mainContainerRef} className="h-full w-full" />
      {/* 沖縄インセット（左上の小窓）。クリックで本体地図が沖縄へ移動。
          ズームイン時は邪魔にならないよう自動で隠す */}
      <div
        role="button"
        tabIndex={0}
        title="クリックで沖縄を拡大"
        onClick={flyToOkinawa}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") flyToOkinawa();
        }}
        className={`absolute left-3 top-24 z-10 cursor-pointer overflow-hidden rounded-lg border border-stone-300 bg-white shadow-md transition-all duration-300 hover:border-brand-400 hover:shadow-lg ${
          insetVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          ref={insetContainerRef}
          className="pointer-events-none h-[120px] w-[160px] sm:h-[190px] sm:w-[250px]"
        />
        <span className="absolute left-1.5 top-1 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-stone-500">
          沖縄
        </span>
        <span className="absolute bottom-1 right-1.5 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-stone-400">
          クリックで拡大 🔍
        </span>
      </div>
    </div>
  );
}
