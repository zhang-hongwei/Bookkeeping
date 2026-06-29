import { redirect } from "next/navigation";

// 首页直接进入主应用（记账），原 Dev Tools 集合已移除。
export default function Home() {
  redirect("/finance");
}
