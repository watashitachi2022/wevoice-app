"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MaplibreMap, Marker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PublicOrg } from "@/types/org";

const SEA_COLOR = "#d8eaf6";

// ベクター地図スタイル（OpenFreeMap: 無料・APIキー不要・商用可）
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

// 本体地図: 本州〜九州・北海道（沖縄・奄美はインセットに分離）
const MAIN_CENTER: [number, number] = [137.8, 38.0];
const MAIN_BOUNDS: [[number, number], [number, number]] = [
  [127, 29.5],
  [150, 46.5],
];

// インセット（左上の小窓）: 沖縄・奄美エリア
const INSET_CENTER: [number, number] = [127.9, 26.5];
const INSET_ZOOM = 6.4;
// この緯度より南の団体はインセット側に表示する
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

function createEmojiMarker(
  org: PublicOrg,
  map: MaplibreMap,
  onClick: (id: string) => void
) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "emoji-pin-gl";
  el.textContent = org.emoji;
  el.setAttribute("aria-label", org.name);
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick(org.id);
  });
  return new Marker({ element: el, anchor: "bottom" })
    .setLngLat([org.lng!, org.lat!])
    .addTo(map);
}

const isInsetOrg = (org: PublicOrg) =>
  org.lat != null && org.lat < INSET_LAT_THRESHOLD;

type Props = {
  orgs: PublicOrg[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// MapLibre GL によるベクター地図（本体 + 沖縄インセット）
export default function OrgMap({ orgs, selectedId, onSelect }: Props) {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const insetContainerRef = useRef<HTMLDivElement>(null);
  const mainMapRef = useRef<MaplibreMap | null>(null);
  const insetMapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());
  const [insetVisible, setInsetVisible] = useState(true);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // 地図の初期化（マウント時に1回）
  useEffect(() => {
    if (!mainContainerRef.current || !insetContainerRef.current) return;

    const mainMap = new MaplibreMap({
      container: mainContainerRef.current,
      style: MAP_STYLE,
      center: MAIN_CENTER,
      zoom: 5,
      minZoom: 4.8,
      maxZoom: 17,
      maxBounds: MAIN_BOUNDS,
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
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      mainMap.remove();
      insetMap.remove();
      mainMapRef.current = null;
      insetMapRef.current = null;
    };
  }, []);

  // マーカーの同期（沖縄・奄美の団体はインセット側に置く）
  useEffect(() => {
    const mainMap = mainMapRef.current;
    const insetMap = insetMapRef.current;
    if (!mainMap || !insetMap) return;
    const markers = markersRef.current;
    const wanted = new Set<string>();

    for (const org of orgs) {
      if (org.lat == null || org.lng == null) continue;
      wanted.add(org.id);
      if (markers.has(org.id)) continue;
      const targetMap = isInsetOrg(org) ? insetMap : mainMap;
      markers.set(
        org.id,
        createEmojiMarker(org, targetMap, (id) => onSelectRef.current(id))
      );
    }
    for (const [id, marker] of markers) {
      if (!wanted.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }
  }, [orgs]);

  // 選択状態の反映（強調表示 + 本体地図のみ移動）
  useEffect(() => {
    const map = mainMapRef.current;
    if (!map) return;
    for (const [id, marker] of markersRef.current) {
      marker.getElement().classList.toggle("selected", id === selectedId);
    }
    const org = orgs.find((o) => o.id === selectedId);
    if (org?.lat != null && org?.lng != null && !isInsetOrg(org)) {
      map.flyTo({
        center: [org.lng, org.lat],
        zoom: Math.max(map.getZoom(), 9),
        duration: 700,
      });
    }
  }, [selectedId, orgs]);

  return (
    <div className="relative h-full w-full" style={{ background: SEA_COLOR }}>
      {/* MapLibreはコンテナのpositionをrelativeに上書きするため、absoluteではなくh-fullで広げる */}
      <div ref={mainContainerRef} className="h-full w-full" />
      {/* 沖縄インセット（左上の小窓）。ズームイン時は邪魔にならないよう自動で隠す */}
      <div
        className={`absolute left-3 top-24 z-10 overflow-hidden rounded-lg border border-stone-300 bg-white shadow-md transition-opacity duration-300 ${
          insetVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div ref={insetContainerRef} className="h-[190px] w-[250px]" />
        <span className="absolute left-1.5 top-1 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-stone-500">
          沖縄
        </span>
      </div>
    </div>
  );
}
