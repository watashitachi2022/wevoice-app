import { fetchPublishedOrgs, fetchActiveTags } from "@/lib/queries";
import HomeClient from "@/components/HomeClient";
import type { PublicOrg, Tag } from "@/types/org";

// ISR: 1時間ごとの再生成 + 管理画面の承認/編集時に revalidatePath("/") で即時反映
export const revalidate = 3600;

export default async function HomePage() {
  let orgs: PublicOrg[] = [];
  let tags: Tag[] = [];
  try {
    [orgs, tags] = await Promise.all([fetchPublishedOrgs(), fetchActiveTags()]);
  } catch (e) {
    // DB未構築・接続不可時もページ自体は表示する（空状態を出す）
    console.error("公開データの取得に失敗:", e);
  }
  return <HomeClient orgs={orgs} tags={tags} />;
}
