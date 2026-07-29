"use client";

import { useEffect, useRef } from "react";
import { Map as MaplibreMap, Marker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PublicOrg } from "@/types/org";

const JAPAN_CENTER: [number, number] = [137.5, 36.5]; // [lng, lat]
const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [120, 22],
  [152, 48],
];
const SEA_COLOR = "#d8eaf6";

// ベクター地図スタイル（OpenFreeMap: 無料・APIキー不要・商用可）
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

type Props = {
  orgs: PublicOrg[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// MapLibre GL によるベクター地図。
// - GPU描画のためズーム・ドラッグ・慣性がネイティブでなめらか
// - 日本の輪郭で穴を開けたマスクレイヤーを最上段に重ね、日本国外を海色で覆う
//   （GLレイヤーなのでドラッグ中も途切れない）
export default function OrgMap({ orgs, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // 地図の初期化（マウント時に1回）
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MaplibreMap({
      container: containerRef.current,
      style: MAP_STYLE,
      center: JAPAN_CENTER,
      zoom: 4.8,
      minZoom: 4.3,
      maxZoom: 17,
      maxBounds: JAPAN_BOUNDS,
      attributionControl: { compact: true },
    });
    map.addControl(
      new NavigationControl({ showCompass: false }),
      "top-left"
    );
    map.touchPitch.disable();
    map.dragRotate.disable();

    map.on("load", async () => {
      // 地名ラベルを日本語優先にする
      for (const layer of map.getStyle().layers) {
        if (layer.type !== "symbol") continue;
        if (!map.getLayoutProperty(layer.id, "text-field")) continue;
        map.setLayoutProperty(layer.id, "text-field", [
          "coalesce",
          ["get", "name:ja"],
          ["get", "name"],
        ]);
      }
      // 海の色をブランドトーンに合わせる
      if (map.getLayer("water")) {
        map.setPaintProperty("water", "fill-color", SEA_COLOR);
      }

      // 日本の輪郭マスク（輪郭データ: 全球地図日本（国土地理院）を簡略化）
      try {
        const res = await fetch("/japan-outline.geojson");
        const geo = await res.json();
        const geometries: Array<{ type: string; coordinates: unknown }> =
          geo.type === "GeometryCollection"
            ? geo.geometries
            : geo.type === "FeatureCollection"
              ? geo.features.map((f: { geometry: never }) => f.geometry)
              : [geo];
        const holes: [number, number][][] = [];
        for (const geom of geometries) {
          const polys = (
            geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates
          ) as [number, number][][][];
          for (const poly of polys) holes.push(poly[0]);
        }
        const world: [number, number][] = [
          [-180, -85],
          [180, -85],
          [180, 85],
          [-180, 85],
          [-180, -85],
        ];
        map.addSource("japan-mask", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "Polygon", coordinates: [world, ...holes] },
          },
        });
        // 最上段に追加 → 日本国外の陸地・ラベルをすべて覆う
        map.addLayer({
          id: "japan-mask",
          type: "fill",
          source: "japan-mask",
          paint: { "fill-color": SEA_COLOR, "fill-opacity": 1 },
        });
      } catch (e) {
        console.error("日本輪郭データの読み込みに失敗:", e);
      }
    });

    mapRef.current = map;
    if (process.env.NODE_ENV === "development") {
      (window as unknown as Record<string, unknown>).__wvMap = map;
    }
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // マーカーの同期
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    const wanted = new Set<string>();

    for (const org of orgs) {
      if (org.lat == null || org.lng == null) continue;
      wanted.add(org.id);
      if (markers.has(org.id)) continue;
      const el = document.createElement("button");
      el.type = "button";
      el.className = "emoji-pin-gl";
      el.textContent = org.emoji;
      el.setAttribute("aria-label", org.name);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(org.id);
      });
      const marker = new Marker({ element: el, anchor: "bottom" })
        .setLngLat([org.lng, org.lat])
        .addTo(map);
      markers.set(org.id, marker);
    }
    // 絞り込みで消えた団体のマーカーを除去
    for (const [id, marker] of markers) {
      if (!wanted.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }
  }, [orgs]);

  // 選択状態の反映（強調表示 + 移動）
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const [id, marker] of markersRef.current) {
      marker.getElement().classList.toggle("selected", id === selectedId);
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

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ background: SEA_COLOR }}
    />
  );
}
