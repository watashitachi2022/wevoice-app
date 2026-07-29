import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-50 text-sm text-stone-600">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/apply" className="hover:text-brand-600">
            団体の方はこちら（掲載無料）
          </Link>
          <Link href="/privacy" className="hover:text-brand-600">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="hover:text-brand-600">
            利用規約
          </Link>
          <Link href="/about" className="hover:text-brand-600">
            運営者情報
          </Link>
        </div>
        <p className="text-xs text-stone-400">© We Voice</p>
      </div>
    </footer>
  );
}
