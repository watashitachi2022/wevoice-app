import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "運営者情報" };

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 text-sm leading-relaxed text-stone-700">
        <h1 className="mb-4 text-xl font-bold text-stone-900">運営者情報</h1>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-bold text-stone-500">サービス名</dt>
              <dd>We Voice — 声でつながる、地域共創プラットフォーム</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-stone-500">運営</dt>
              <dd>We Voice 運営事務局（正式名称・連絡先は準備中）</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-stone-500">事業内容</dt>
              <dd>
                子育て世代・地域住民と地域団体をつなぐ情報プラットフォームの運営。掲載は無料です。
              </dd>
            </div>
          </dl>
        </div>
      </main>
      <Footer />
    </div>
  );
}
