import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "プライバシーポリシー" };

// 暫定版（Phase 1）。Phase 2 でデータ第三者提供・提案資料利用の同意文言を含む
// 正式版に差し替える（文面は運営side確認のうえ確定）。
export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8 text-sm leading-relaxed text-stone-700">
        <h1 className="text-xl font-bold text-stone-900">プライバシーポリシー（暫定版）</h1>
        <p>
          We Voice（以下「当サービス」）は、掲載申請の際にご提供いただく個人情報を、以下の方針に基づき取り扱います。
        </p>
        <section>
          <h2 className="mb-1 font-bold text-stone-900">1. 取得する情報</h2>
          <p>
            団体名、活動地域、連絡先メールアドレス、担当者名など、掲載申請フォームにご入力いただいた情報を取得します。
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-bold text-stone-900">2. 利用目的</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>掲載申請の確認・審査・掲載可否のご連絡のため</li>
            <li>掲載情報の更新・継続確認のご連絡のため</li>
            <li>当サービスの運営・改善のため</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-1 font-bold text-stone-900">3. 公開範囲</h2>
          <p>
            連絡先メールアドレス・担当者名・電話番号・番地は公開されません。公開されるのは、団体名・活動地域（市区町村まで）・団体紹介などの掲載情報のみです。
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-bold text-stone-900">4. 第三者提供</h2>
          <p>
            ご本人の同意がある場合または法令に基づく場合を除き、取得した個人情報を第三者に提供しません。
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-bold text-stone-900">5. お問い合わせ</h2>
          <p>個人情報の取り扱いに関するお問い合わせは、運営者情報ページに記載の連絡先までお願いします。</p>
        </section>
        <p className="text-xs text-stone-400">
          本ポリシーは暫定版です。正式版の公開時に内容が更新される場合があります。
        </p>
      </main>
      <Footer />
    </div>
  );
}
