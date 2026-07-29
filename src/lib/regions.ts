// 都道府県 → 地方ブロックのマッピング（DB書き込み時・絞り込みUIの唯一の情報源）
// 既存アプリのブロック分け（北海道/東北/関東/東海/北陸/関西/中国/九州/沖縄）に
// 四国を追加。山梨・長野・新潟は「北陸・甲信越」として北陸ブロックに含める。

export const REGIONS = [
  "北海道",
  "東北",
  "関東",
  "東海",
  "北陸",
  "関西",
  "中国",
  "四国",
  "九州",
  "沖縄",
] as const;

export type Region = (typeof REGIONS)[number];

export const PREFECTURE_TO_REGION: Record<string, Region> = {
  北海道: "北海道",
  青森県: "東北",
  岩手県: "東北",
  宮城県: "東北",
  秋田県: "東北",
  山形県: "東北",
  福島県: "東北",
  茨城県: "関東",
  栃木県: "関東",
  群馬県: "関東",
  埼玉県: "関東",
  千葉県: "関東",
  東京都: "関東",
  神奈川県: "関東",
  新潟県: "北陸",
  富山県: "北陸",
  石川県: "北陸",
  福井県: "北陸",
  山梨県: "北陸",
  長野県: "北陸",
  岐阜県: "東海",
  静岡県: "東海",
  愛知県: "東海",
  三重県: "東海",
  滋賀県: "関西",
  京都府: "関西",
  大阪府: "関西",
  兵庫県: "関西",
  奈良県: "関西",
  和歌山県: "関西",
  鳥取県: "中国",
  島根県: "中国",
  岡山県: "中国",
  広島県: "中国",
  山口県: "中国",
  徳島県: "四国",
  香川県: "四国",
  愛媛県: "四国",
  高知県: "四国",
  福岡県: "九州",
  佐賀県: "九州",
  長崎県: "九州",
  熊本県: "九州",
  大分県: "九州",
  宮崎県: "九州",
  鹿児島県: "九州",
  沖縄県: "沖縄",
};

export const PREFECTURES = Object.keys(PREFECTURE_TO_REGION);

export function regionOfPrefecture(prefecture: string): Region {
  const region = PREFECTURE_TO_REGION[prefecture];
  if (!region) throw new Error(`未知の都道府県です: ${prefecture}`);
  return region;
}
