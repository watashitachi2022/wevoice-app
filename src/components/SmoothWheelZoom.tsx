"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

// ホイール/トラックパッドでのシームレスなズーム。
// - ズーム基準は常に地図の中心（カーソル基準だとズーム中に地図が縦横に流れて
//   「スクロールで画面が動く」誤操作感が出るため）
// - 入力は目標値に積み、requestAnimationFrame で目標へ滑らかに追従させることで
//   トラックパッドの慣性スクロールによる連打・ガタつきを吸収する
// - トラックパッドのピンチ操作は ctrlKey 付き wheel として届くため感度を上げる
// MapContainer に zoomSnap={0} を指定して使うこと（小数ズームを許可するため）。
export default function SmoothWheelZoom({ sensitivity = 0.0015 }: { sensitivity?: number }) {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();
    const container = map.getContainer();

    let targetZoom = map.getZoom();
    let rafId: number | null = null;

    const step = () => {
      const current = map.getZoom();
      const diff = targetZoom - current;
      if (Math.abs(diff) < 0.01) {
        map.setZoom(targetZoom, { animate: false });
        rafId = null;
        return;
      }
      // 毎フレーム残差の25%ずつ近づける（イージング）
      map.setZoom(current + diff * 0.25, { animate: false });
      rafId = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // ピンチ（ctrlKey付きwheel）はdeltaが小さいため感度を上げる
      const factor = e.ctrlKey ? sensitivity * 5 : sensitivity;
      targetZoom = Math.min(
        map.getMaxZoom(),
        Math.max(map.getMinZoom(), targetZoom - e.deltaY * factor)
      );
      if (rafId == null) rafId = requestAnimationFrame(step);
    };

    // ユーザーが+/-ボタンやピンチ以外でズームした場合に目標値を同期する
    const onZoomEnd = () => {
      if (rafId == null) targetZoom = map.getZoom();
    };
    map.on("zoomend", onZoomEnd);

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      map.off("zoomend", onZoomEnd);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [map, sensitivity]);

  return null;
}
