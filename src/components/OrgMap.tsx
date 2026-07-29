"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PublicOrg } from "@/types/org";

const JAPAN_CENTER: [number, number] = [36.5, 137.5];

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
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
    </MapContainer>
  );
}
