import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchActiveTags } from "@/lib/queries";
import type { Tag } from "@/types/org";
import ApplyForm from "./ApplyForm";

export const metadata: Metadata = { title: "掲載申請（無料）" };
export const revalidate = 3600;

export default async function ApplyPage() {
  let tags: Tag[] = [];
  try {
    tags = await fetchActiveTags();
  } catch (e) {
    console.error("タグの取得に失敗:", e);
  }
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <h1 className="text-xl font-bold text-stone-900">掲載申請（無料）</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          3分程度で入力できます。運営で内容を確認したうえで掲載を開始します（審査結果はメールでご連絡します）。
          掲載・更新に費用は一切かかりません。
        </p>
        <div className="mt-6">
          <ApplyForm tags={tags} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
