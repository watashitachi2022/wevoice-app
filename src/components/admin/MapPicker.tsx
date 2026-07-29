"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const JAPAN_CENTER: [number, number] = [36.5, 137.5];

const pinIcon = L.divIcon({
  className: "emoji-pin",
  html: "<span>📍</span>",
  iconSize: [28, 28],
  iconAnchor: [14, 24],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

function PanTo({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 13));
    }
  }, [lat, lng, map]);
  return null;
}

type Props = {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
};

// 承認・編集画面用: クリックでピン位置を設定できる地図
export default function MapPicker({ lat, lng, onPick }: Props) {
  return (
    <MapContainer
      center={lat != null && lng != null ? [lat, lng] : JAPAN_CENTER}
      zoom={lat != null && lng != null ? 13 : 5}
      className="h-72 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lat != null && lng != null && <Marker position={[lat, lng]} icon={pinIcon} />}
      <ClickHandler onPick={onPick} />
      <PanTo lat={lat} lng={lng} />
    </MapContainer>
  );
}
