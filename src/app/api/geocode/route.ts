import { NextRequest, NextResponse } from "next/server";

// 国土地理院 ジオコーディングAPI のプロキシ（管理画面の承認/編集で使用）
// https://msearch.gsi.go.jp/address-search/AddressSearch?q=<住所>
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }
  const res = await fetch(
    `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(q)}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) {
    return NextResponse.json({ error: "geocoding failed" }, { status: 502 });
  }
  const data: Array<{
    geometry: { coordinates: [number, number] };
    properties: { title: string };
  }> = await res.json();

  const candidates = data.slice(0, 5).map((f) => ({
    label: f.properties.title,
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }));
  return NextResponse.json({ candidates });
}
