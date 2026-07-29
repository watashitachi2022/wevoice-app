"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { applicationSchema } from "@/lib/validation";

export type SubmitResult = { ok: false; message: string } | never;

// 申請フォームの受付（anonから許可された唯一の書き込み経路。secret key経由でINSERT）
// TODO(Phase 1後半): Turnstileキー発行後、トークンのサーバー側検証をここに追加する
export async function submitApplication(
  input: unknown,
  honeypot: string
): Promise<SubmitResult> {
  // honeypot: 人間には見えない入力欄が埋まっていたらbotとみなし、
  // 成功したふりをして何もしない
  if (honeypot) redirect("/apply/complete");

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "入力内容に不備があります。もう一度ご確認ください。" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("applications").insert({
    payload: parsed.data,
    type: "new",
  });
  if (error) {
    console.error("申請の保存に失敗:", error);
    return {
      ok: false,
      message: "送信に失敗しました。時間をおいて再度お試しください。",
    };
  }

  // TODO(Phase 1後半): Resend導入後、受付メールの自動送信をここに追加する
  redirect("/apply/complete");
}
