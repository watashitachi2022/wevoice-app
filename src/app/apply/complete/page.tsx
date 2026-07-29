import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "申請を受け付けました" };

export default function ApplyCompletePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="text-6xl">🎉</span>
        <h1 className="mt-4 text-xl font-bold text-stone-900">申請を受け付けました</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          運営で内容を確認したうえで掲載を開始します。
          <br />
          審査結果は、ご入力いただいたメールアドレスへご連絡します。
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-600"
        >
          トップページへもどる
        </Link>
      </main>
      <Footer />
    </div>
  );
}
