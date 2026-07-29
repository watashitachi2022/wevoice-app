// 日本国外を覆うマスクGeoJSONの生成スクリプト
// 使い方: node scripts/build-mask.mjs
//
// 「巨大な外周リング + 数百の穴」を1つのポリゴンで表現すると、MapLibreの
// 三角形分割が壊れて陸地に切り込み状の描画欠けが出る。これを避けるため、
// 日本周辺を矩形グリッドに分割し、各セルから日本の陸地を差し引いた
// 小さな単純ポリゴンの集合として事前計算する。
import { readFileSync, writeFileSync } from "node:fs";
import difference from "@turf/difference";
import { polygon, featureCollection, feature } from "@turf/helpers";

const OUTLINE_PATH = "scripts/data/japan-outline.geojson";
const OUT_PATH = "public/japan-mask.geojson";

// マスクで覆う範囲（本体地図・インセットのmaxBoundsより十分広く）
const WEST = 110, EAST = 170, SOUTH = 5, NORTH = 60;
const CELL = 5; // グリッドセルのサイズ（度）

const outline = JSON.parse(readFileSync(OUTLINE_PATH, "utf8"));
const japanGeom =
  outline.type === "GeometryCollection"
    ? outline.geometries[0]
    : outline.type === "FeatureCollection"
      ? outline.features[0].geometry
      : outline;
const japan = feature(japanGeom);

const features = [];
for (let x = WEST; x < EAST; x += CELL) {
  for (let y = SOUTH; y < NORTH; y += CELL) {
    const cell = polygon([
      [
        [x, y],
        [x + CELL, y],
        [x + CELL, y + CELL],
        [x, y + CELL],
        [x, y],
      ],
    ]);
    const diff = difference(featureCollection([cell, japan]));
    if (diff) features.push(diff);
  }
}

const out = featureCollection(features);
writeFileSync(OUT_PATH, JSON.stringify(out));
console.log(
  `${OUT_PATH} を生成しました（${features.length}セル, ${Math.round(JSON.stringify(out).length / 1024)}KB）`
);
