/**
 * 记账页（US1 MVP）：/finance
 * 渲染复式记账主面板。认证与导航由 (main) 布局提供。
 */
import { FinanceDashboard } from '@/features/finance/components/FinanceDashboard';

export default function FinancePage() {
  return <FinanceDashboard />;
}
