import { z } from "zod";
import { PREFECTURES } from "./regions";

const optionalUrl = z
  .string()
  .trim()
  .url({ message: "URLの形式が正しくありません" })
  .or(z.literal(""))
  .optional();

// 掲載申請フォーム（クライアント・Server Action 両方で使用）
// 必須: 団体名 / カテゴリ（タグ） / 都道府県・市区町村 / 連絡先メール
export const applicationSchema = z.object({
  name: z.string().trim().min(1, "団体名を入力してください").max(100),
  tag_ids: z.array(z.string().uuid()).min(1, "カテゴリを1つ以上選択してください").max(3),
  prefecture: z.string().refine((v) => PREFECTURES.includes(v), "都道府県を選択してください"),
  city: z.string().trim().min(1, "市区町村を入力してください").max(50),
  contact_email: z.string().trim().email("メールアドレスの形式が正しくありません"),
  // 任意項目
  emoji: z.string().trim().max(8).optional(),
  voice: z.string().trim().max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  member_scale: z.string().trim().max(50).optional(),
  contact_name: z.string().trim().max(50).optional(),
  website_url: optionalUrl,
  instagram_url: optionalUrl,
  sns_url: optionalUrl,
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const EMOJI_CHOICES = [
  "🏘️", "🎙️", "🍚", "🎒", "😊", "🧩", "🤝", "🌳", "🌏", "🎪",
  "🥕", "❄️", "🍛", "🩺", "🌈", "🛶", "🏡", "🎨", "🏙️", "⛺",
  "🌺", "🐄", "📚", "⚽", "🎵", "🧑‍🍳", "🚜", "💐", "🏥", "🛝",
];
