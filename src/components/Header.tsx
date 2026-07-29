import Link from "next/link";
import Image from "next/image";

type Props = {
  orgCount?: number;
  prefectureCount?: number;
};

// ヘッダーは画面横幅いっぱいを使い、ロゴを左端・統計/申請ボタンを右端に寄せる。
// 配色は we-voice.net と同じ 黄→コーラル のグラデーション。
export default function Header({ orgCount, prefectureCount }: Props) {
  return (
    <header className="brand-gradient text-white shadow-md">
      <div className="flex w-full items-center gap-4 px-4 py-3 sm:px-6">
        {/* ロゴSVGは下端付近に文字のベースラインがあるため、items-end でベースラインを揃える */}
        <Link href="/" className="flex min-w-0 items-end gap-3">
          {/* 公式ロゴ（グラデーション上で読めるよう白抜きにする） */}
          <Image
            src="/logo.svg"
            alt="We voice"
            width={158}
            height={30}
            priority
            className="h-7 w-auto brightness-0 invert sm:h-8"
          />
          <span className="hidden truncate pb-[3px] text-sm leading-none text-white/90 lg:inline">
            声でつながる、地域共創プラットフォーム
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-2">
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
            className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-500 shadow-sm transition hover:bg-brand-50"
          >
            掲載申請（無料）
          </Link>
        </div>
      </div>
    </header>
  );
}
