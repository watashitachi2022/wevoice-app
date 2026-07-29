import Link from "next/link";

type Props = {
  orgCount?: number;
  prefectureCount?: number;
};

export default function Header({ orgCount, prefectureCount }: Props) {
  return (
    <header className="bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">🎙️ We Voice</span>
          <span className="hidden text-sm text-brand-100 sm:inline">
            声でつながる、地域共創プラットフォーム
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {orgCount !== undefined && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
              全{orgCount}団体
            </span>
          )}
          {prefectureCount !== undefined && prefectureCount > 0 && (
            <span className="hidden rounded-full bg-white/20 px-3 py-1 text-xs font-medium sm:inline">
              {prefectureCount}都道府県
            </span>
          )}
          <Link
            href="/apply"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-600 shadow-sm transition hover:bg-brand-50"
          >
            掲載申請（無料）
          </Link>
        </div>
      </div>
    </header>
  );
}
