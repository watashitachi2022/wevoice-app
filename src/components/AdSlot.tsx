// ダミー広告枠（Phase 1）。Phase 2 で ads テーブルからの配信に置き換える。
export default function AdSlot({ placement }: { placement: "sidebar" | "detail_panel" }) {
  return (
    <div
      data-placement={placement}
      className="flex h-20 items-center justify-center rounded-lg border border-dashed border-brand-200 bg-brand-50/60 text-xs text-brand-300"
    >
      広告掲載枠
    </div>
  );
}
