"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PublicOrg } from "@/types/org";
import SmoothWheelZoom from "./SmoothWheelZoom";

const JAPAN_CENTER: [number, number] = [36.5, 137.5];

// 表示範囲を日本周辺に制限
const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [22, 120],
  [48, 152],
];

const SEA_COLOR = "#d8eaf6";

function emojiIcon(emoji: string, selected: boolean) {
  return L.divIcon({
    className: "emoji-pin",
    html: `<span style="${selected ? "font-size:38px;" : ""}">${emoji}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 24],
  });
}

// 日本の輪郭で穴を開けたマスクをタイルの上に重ね、日本国外（海・周辺国）を隠す。
// 国内は地理院タイルの道路・地名がそのまま見える。輪郭データ: 全球地図日本（国土地理院）
function JapanMask() {
  const map = useMap();
  useEffect(() => {
    let layer: L.Polygon | null = null;
    let cancelled = false;
    fetch("/japan-outline.geojson")
      .then((res) => res.json())
      .then((geo) => {
        if (cancelled) return;
        // FeatureCollection / GeometryCollection どちらの形式でもジオメトリを取り出す
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
          for (const poly of polys) {
            holes.push(
              poly[0].map(([lng, lat]) => [lat, lng] as [number, number])
            );
          }
        }
        const world: [number, number][] = [
          [-85, -180],
          [85, -180],
          [85, 180],
          [-85, 180],
        ];
        layer = L.polygon([world, ...holes], {
          stroke: false,
          fillColor: SEA_COLOR,
          fillOpacity: 1,
          interactive: false,
        }).addTo(map);
      })
      .catch((e) => console.error("日本輪郭データの読み込みに失敗:", e));
    return () => {
      cancelled = true;
      layer?.remove();
    };
  }, [map]);
  return null;
}

// 選択された団体へ地図を移動させる
function FlyToSelected({ org }: { org: PublicOrg | null }) {
  const map = useMap();
  useEffect(() => {
    if (org?.lat && org?.lng) {
      map.flyTo([org.lat, org.lng], Math.max(map.getZoom(), 9), { duration: 0.6 });
    }
  }, [org, map]);
  return null;
}

type Props = {
  orgs: PublicOrg[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function OrgMap({ orgs, selectedId, onSelect }: Props) {
  const selectedOrg = orgs.find((o) => o.id === selectedId) ?? null;

  return (
    <MapContainer
      center={JAPAN_CENTER}
      zoom={5}
      minZoom={5}
      maxZoom={17}
      zoomSnap={0}
      maxBounds={JAPAN_BOUNDS}
      maxBoundsViscosity={1.0}
      className="japan-map h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
      />
      <JapanMask />
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
    </MapContainer>
  );
}
