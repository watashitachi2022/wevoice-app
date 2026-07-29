import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "利用規約" };

export default function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 text-sm leading-relaxed text-stone-700">
        <h1 className="mb-4 text-xl font-bold text-stone-900">利用規約</h1>
        <p>利用規約は現在準備中です。正式公開までしばらくお待ちください。</p>
      </main>
      <Footer />
    </div>
  );
}
