// Finance 领域 schema barrel。
// 通过 src/database/schema/index.ts 的 `export * from "./finance"` 被 drizzle-kit 与应用代码识别。
export * from './accounts';
export * from './categories';
export * from './transactions';
export * from './bill-imports';
export * from './net-worth-snapshots';
export * from './rule-findings';
export * from './ai-reports';
export * from './asset-details';
export * from './liability-details';
export * from './instruments';
export * from './positions';
export * from './investment-trades';
export * from './dca-plans';
export * from './families';
export * from './family-snapshots';
// Phase 6：AI 财富顾问（预测 / 预警 / 顾问 / 审批）
export * from './cash-flow-forecasts';
export * from './smart-alerts';
export * from './approvals';
export * from './advisor';
export * from './relations';
