"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Leaflet標準のホイールズームは入力を溜めてから段階的にズームするため動きがカクつく。
// 標準処理を無効化し、ホイール量に比例してカーソル位置基準で連続ズームさせる。
// MapContainer に zoomSnap={0} を指定して使うこと（小数ズームを許可するため）。
export default function SmoothWheelZoom({ sensitivity = 0.002 }: { sensitivity?: number }) {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();
    const container = map.getContainer();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const point: [number, number] = [e.clientX - rect.left, e.clientY - rect.top];
      const next = map.getZoom() - e.deltaY * sensitivity;
      const clamped = Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), next));
      map.setZoomAround(point, clamped, { animate: false });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [map, sensitivity]);

  return null;
}
