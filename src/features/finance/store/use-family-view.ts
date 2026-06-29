/**
 * 家庭视图切换局部状态（Phase 4 / US1，决策8）。
 *
 * 个人 ⇄ 家庭视图瞬时切换、无数据串扰（SC-005）：切换仅改读哪条端点
 * （个人 net-worth vs 家庭 family-net-worth），无可变共享状态。
 */
import { create } from 'zustand';

export type FinanceView = 'personal' | 'family';

interface FamilyViewState {
  /** 当前视图（默认 personal；用户在家庭成员行上的 defaultView 可覆盖默认）。 */
  view: FinanceView;
  /** 当前选中家庭 id（用户的 active 家庭；本阶段通常 1 个）。 */
  familyId: string | null;
  setView: (view: FinanceView) => void;
  setFamilyId: (id: string | null) => void;
}

export const useFamilyView = create<FamilyViewState>((set) => ({
  view: 'personal',
  familyId: null,
  setView: (view) => set({ view }),
  setFamilyId: (familyId) => set({ familyId }),
}));
