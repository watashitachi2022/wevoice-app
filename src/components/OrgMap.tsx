"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject } from "geojson";
import type { PublicOrg } from "@/types/org";
import SmoothWheelZoom from "./SmoothWheelZoom";

const JAPAN_CENTER: [number, number] = [36.5, 137.5];

// 表示範囲を日本周辺に制限
const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [22, 120],
  [48, 152],
];

function emojiIcon(emoji: string, selected: boolean) {
  return L.divIcon({
    className: "emoji-pin",
    html: `<span style="${selected ? "font-size:38px;" : ""}">${emoji}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 24],
  });
}

// 選択された団体へ地図を移動させる
function FlyToSelected({ org }: { org: PublicOrg | null }) {
  const map = useMap();
  useEffect(() => {
    if (org?.lat && org?.lng) {
      map.flyTo([org.lat, org.lng], Math.max(map.getZoom(), 8), { duration: 0.6 });
    }
  }, [org, map]);
  return null;
}

type Props = {
  orgs: PublicOrg[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// タイル地図だと周辺国が必ず写り込むため、日本の都道府県ポリゴン（GeoJSON）だけを
// 描画するスタイライズド地図にしている。データ出典: 全球地図日本（国土地理院）
export default function OrgMap({ orgs, selectedId, onSelect }: Props) {
  const selectedOrg = orgs.find((o) => o.id === selectedId) ?? null;
  const [japan, setJapan] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    fetch("/japan.geojson")
      .then((res) => res.json())
      .then(setJapan)
      .catch((e) => console.error("日本地図データの読み込みに失敗:", e));
  }, []);

  return (
    <MapContainer
      center={JAPAN_CENTER}
      zoom={5}
      minZoom={4.5}
      maxZoom={10}
      zoomSnap={0}
      maxBounds={JAPAN_BOUNDS}
      maxBoundsViscosity={1.0}
      className="japan-map h-full w-full"
      attributionControl={false}
    >
      {japan && (
        <GeoJSON
          data={japan}
          style={{
            fillColor: "#ffffff",
            fillOpacity: 1,
            color: "#cbd5e1",
            weight: 0.8,
          }}
        />
      )}
      {orgs
        .filter((o) => o.lat != null && o.lng != null)
        .map((org) => (
          <Marker
            key={org.id}
            position={[org.lat!, org.lng!]}
            icon={emojiIcon(org.emoji, org.id === selectedId)}
            eventHandlers={{ click: () => onSelect(org.id) }}
          />
        ))}
      <FlyToSelected org={selectedOrg} />
      <SmoothWheelZoom />
      <div className="leaflet-bottom leaflet-right">
        <div className="leaflet-control m-1 rounded bg-white/70 px-1.5 py-0.5 text-[10px] text-stone-400">
          地図データ: 全球地図日本（国土地理院）
        </div>
      </div>
    </MapContainer>
  );
}
