---
description: "Task list for feature implementation"
---

# Tasks: 家庭财务 (Phase 4)

**Input**: Design documents from `/specs/005-family-finance/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md（均已就绪）

**Tests**: 本特性**包含测试**。原因：spec 的成功标准 SC-001..SC-005 均为可测不变式（家庭净资产=Σ成员、私有 100% 不可见、越权 100% 拒绝、退出数据完整+快照保留、切换无串扰），data-model.md §6 列出 I1–I8 不变量，quickstart.md §7 明确测试文件，且 CLAUDE.md 强制测试文化。沿用仓库既有两层模式（见 `tests/finance/_helpers.ts`）：**纯函数测试始终运行**（无 DB），**集成测试由 `FINANCE_INTEGRATION_TEST=1` 门控**（需真实 Postgres 测试库 + `scripts/init-finance.mjs`）。每个故事「先写测试、确保失败再实现」。

**Organization**: 任务按用户故事分组（US1 P1 / US2 P2 / US3 P3）。Phase 1 Setup → Phase 2 Foundational（阻塞所有故事的 schema + 迁移 + repository + 家庭鉴权 + 纯聚合函数）→ Phase 3-5 各用户故事 → Phase 6 Polish。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、不依赖未完成任务）
- **[Story]**: 归属用户故事（US1/US2/US3）；Setup/Foundational/Polish 阶段**无** story 标签
- 描述内必须含**精确文件路径**，并附依赖 `（依赖 Tx）` 与文档引用 `（data-model.md §N / research.md 决策N / contracts/api.md §N / quickstart.md §N）`

## Path Conventions

- Schema: `src/database/schema/finance/`（barrel `index.ts`，关系集中在 `relations.ts`）
- Repository: `src/repositories/finance/`（家庭为多用户聚合，**不继承** `FinanceRepository` 的单 userId 绑定，独立用 `db`）
- Service: `src/services/finance/`
- API: `src/app/api/finance/`（共享 `_lib/{auth,validation,serialize}.ts`，新增 `_lib/family-auth.ts`）
- 前端: `src/features/finance/`（扩展既有 `api.ts` DTO + `hooks/use-finance.ts` TanStack Query + `components/`，与 Phase 0–3 UI 同位）
- 测试: `tests/finance/`
- **领域铁律**（沿用全域）：金额一律字符串、内部「分」整数（`toCents`/`fromCents`，`src/services/finance/money.ts`），**禁止浮点**；用户表 `user_id` 为纯文本无 FK；写操作单事务 + best-effort `refreshSnapshots`；家庭净资产**只对 `visibility='shared'` 聚合**（隐私硬过滤）。
- **两套正交聚合口径**（research.md 决策4，去重与隐私根基）：**净资产按账号 `userId`(owner) 聚合**；**收支画像按交易 `memberId` 聚合**。两者不可混淆。

> ⚠️ **关键复用点**（避免重复造轮子）：净资产纯函数 `computeNetWorthFromAccounts(accounts)` / `computeNetWorthAtDatePure(accounts, entries, date)`（`net-worth.service.ts:104/128`）本身与 userId 无关，家庭聚合 = 逐成员调用后求和；`refreshSnapshots` 钩子（`net-worth.service.ts`，best-effort）扩展为顺刷家庭快照；`requireUserId`（`_lib/auth.ts:37`）沿用；错误类 `LedgerInvariantError`（`balance.service.ts:20`）为 `ShareScopeError` 的范本。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认前置阶段就绪、补齐环境变量（本特性为增量，无脚手架）。

- [X] T001 ⚠️ **硬前置**：确认 Phase 0/1/2/3 已实现并达标——`src/database/schema/finance/`（accounts/transactions+entries/categories/asset-liability-details/net-worth-snapshots/positions/instruments）、`src/services/finance/{ledger,balance,net-worth,asset,liability,rules-engine}.service.ts`、纯函数 `computeNetWorthFromAccounts`/`computeNetWorthAtDatePure`、`ensureSystemEquityAccounts()`、`refreshSnapshots` 钩子均存在。运行 `pnpm test --run --silent='passed-only' 'finance'` 确认 Phase 0–3 测试全绿（quickstart.md §1）。**未达标则本特性无法交付**。
- [X] T002 [P] 环境变量：在 `.env.local` 确认/补齐 `DATABASE_URL`、`DATABASE_TEST_URL`（集成测试库）、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`。Phase 4 **无新增必需变量**（quickstart.md §3）。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 所有用户故事共享的数据层 + 迁移 + repository + 家庭鉴权 + 纯聚合函数，必须先完成。
**⚠️ CRITICAL**：未完成本阶段前不得开始任何用户故事。

- [X] T003 新增 `src/database/schema/finance/families.ts`：`finance_families`（id uuid PK defaultRandom、name text、createdByUserId text 无 FK、defaultCurrency varchar8 default CNY、手写 createdAt/updatedAt）+ `finance_family_members`（id uuid PK、familyId uuid FK→families cascade、**userId text 可空**、displayName text 必填、role varchar20 $type 枚举 self/partner/child/parent/other/joint、shareMode varchar16 default shared、status varchar16 default active、defaultView varchar12 default personal、joinedAt、leftAt 可空、时间戳）。索引：`(familyId,status)`、`(userId)`；**部分唯一索引** `(familyId,role) where role in ('self','joint')`。导出枚举常量 `FAMILY_MEMBER_ROLES`/`SHARE_MODES`/`MEMBER_STATUSES`/`DEFAULT_VIEWS` + 类型、`insert/select` schema、`FamilyItem`/`NewFamily`/`FamilyMemberItem`/`NewFamilyMember`（data-model.md §2.1/§2.2 / research.md 决策1）。**不使用 pgEnum**（沿用全域 varchar+$type）。
- [X] T004 [P] 新增 `src/database/schema/finance/family-snapshots.ts`：`finance_family_net_worth_snapshots`（id uuid PK、familyId uuid FK→families cascade、date date、totalAssets/totalLiabilities/netWorth decimal18,2 default 0、memberBreakdown jsonb Record<string,string> default {}、时间戳）；**unique(familyId, date)**。导出 `FamilyNetWorthSnapshotItem`/`NewFamilyNetWorthSnapshot`（data-model.md §2.3 / research.md 决策2）。
- [X] T005 [P] 改 `src/database/schema/finance/transactions.ts`：增 `memberId uuid('member_id').references(() => familyMembers.id, { onDelete: 'set null' })`（**可空**，归属维度）；改 `src/database/schema/finance/accounts.ts`：增 `visibility varchar12 $type<AccountVisibility> default 'shared'` + 导出 `ACCOUNT_VISIBILITIES`/`AccountVisibility`（data-model.md §3 / research.md 决策3/4）。
- [X] T006 扩展 `src/database/schema/finance/relations.ts`（families↔members、members↔snapshots、`transactions.attributedMember` one(familyMembers)）与 `index.ts`（barrel 导出 families + family-snapshots），运行 `pnpm db:generate` + `pnpm db:migrate`（依赖 T003–T005）。迁移为纯增量、可逆（新列可空/有默认）。
- [X] T007 [P] 新增 `src/repositories/finance/family.repository.ts`（**独立用 `db`，不继承 `FinanceRepository`**——家庭是多用户聚合）：`createFamilyWithMembers(tx?)`、`findFamilyById`、`findActiveMember(familyId, userId)`、`listActiveMembers(familyId)`、`findFamiliesByUser(userId)`、`insertMember`/`updateMember`/`softLeaveMember`（status→left, leftAt）（依赖 T003）。
- [X] T008 [P] 新增 `src/repositories/finance/family-net-worth.repository.ts`：`upsert(familyId, date, nw, memberBreakdown)`、`findRange(familyId, from, to)`、`findLatest(familyId)`（镜像 `net-worth.repository.ts` 模式，scope 改 familyId）（依赖 T004）。
- [X] T009 [P] 新增 `src/app/api/finance/_lib/family-auth.ts`：`requireFamilyMembership(familyId, userId): Promise<FamilyMemberItem | NextResponse>` —— 查 `family.repository.findActiveMember`，命中返回成员关系，否则返回 403 `{error:'无权访问该家庭数据', code:'FORBIDDEN'}`；新增 `ShareScopeError extends Error`（镜像 `LedgerInvariantError`，置于 `balance.service.ts` 或同文件导出）。finance 全域此前无 403 路径（research.md 决策9 / contracts/api.md §0.2 / 依赖 T003、T007）。
- [X] T010 [P] 新增纯函数 `src/services/finance/family-aggregate.ts`：`sumMemberNetWorth(memberResults: {memberId: string; netWorth: {totalAssets:Money; totalLiabilities:Money; netWorth:Money}}[])` → `{totalAssets, totalLiabilities, netWorth, memberBreakdown: Record<memberId, netWorth>}`，内部用 cents 求和再 `fromCents`。**纯函数、无 DB**，保证不变量 I1（家庭=Σ成员）、I5（按 memberId 不重复计）（data-model.md §6 / research.md 决策2 / 依赖 `money.ts`）。

**Checkpoint**：3 张新表 + 2 改列已迁移；family/family-net-worth repository 就绪；`requireFamilyMembership`+`ShareScopeError` 可用；`sumMemberNetWorth` 可单测。Phase 3 业务可开始。

---

## Phase 3: User Story 1 - 把家人加进来，看到家庭整体的财富 (Priority: P1) 🎯 MVP

**Goal**: 创建家庭、邀请/加入成员（含预占槽位），切换到家庭合并视图后家庭净资产 = 各成员净资产之和，家庭净资产曲线随时间呈现且与各成员曲线之和要求一致（FR-001/FR-003/FR-008/FR-009，SC-001/SC-005）。
**Independent Test**: 两成员各自录入账户与交易，切换家庭视图 → 家庭净资产 = A+B 且 `memberBreakdown` 拆分正确；家庭曲线 = Σ 成员曲线；非成员访问 → 403。

### Tests for User Story 1（先写测试、确保失败再实现）

- [X] T011 [P] [US1] 纯函数测试 `tests/finance/family-aggregate.test.ts`：`sumMemberNetWorth` = Σ 成员、`memberBreakdown` key 为 memberId、空家庭=0、单成员恒等、金额字符串/内部 cents（I1/I5 / 依赖 T010）。
- [X] T012 [P] [US1] 集成测试（门控 `FINANCE_INTEGRATION_TEST=1`）`tests/finance/family.service.test.ts` 骨架：建家庭 → 自动生成 self + joint 成员；加成员；非成员调家庭端点 → 403（I3 / SC-003）。先写、待实现后转绿。

### Implementation for User Story 1

- [X] T013 [US1] 新增 `src/services/finance/family.service.ts` 的 `createFamily({userId, name, defaultCurrency?})`：**单事务**插 family + `role='self'` 成员（userId=创建者）+ `role='joint'` 成员（userId=null, displayName='家庭·共同'，不可删）；校验创建者无其他 active 家庭（一人一家庭 active，本阶段）；返回 `{family, members}`（contracts/api.md §1.1 / research.md 决策1/5 / 依赖 T007）。
- [X] T014 [US1] 新增 `family.service.ts` 的 `listMyFamilies(userId)` / `getFamilyWithMembers(familyId, userId, {includeLeft?})`（内部用 `requireFamilyMembership`）/ `updateFamily({familyId, userId, name})`（仅 self）/ `dissolveFamily({familyId, userId})`（仅 self；成员 status→left，保留历史快照）（contracts/api.md §1.2-1.5 / 依赖 T007、T009）。
- [X] T015 [US1] 新增 `family.service.ts` 的 `addMember({familyId, actorUserId, userId?, displayName, role, shareMode?})`：校验 role ∉ {self,joint}；防止同一 userId 重复 active 加入；userId 可空（预占槽位，research.md 决策1 / edge case）；返回 member（contracts/api.md §2.1 / 依赖 T007、T009）。
- [X] T016 [US1] 新增 `src/services/finance/family-net-worth.service.ts` 的 `computeFamilyNetWorthLive({familyId, userId, view?})`：取 active 成员 userId 集合 → 逐成员拉 `visibility='shared'` 账号 → 复用 `computeNetWorthFromAccounts`（+ `deriveViewNetWorth` 处理 view）→ `sumMemberNetWorth` 聚合，产出 `memberBreakdown`。**隐私由构造保证**：只读 shared 账号（I2/SC-002）；joint 无账号不贡献净资产（contracts/api.md §3.1 / data-model.md I1/I2 / 依赖 T010）。
- [X] T017 [US1] 新增 `family-net-worth.service.ts` 的 `refreshFamilySnapshots({familyId, date})`（= Σ 成员该日 shared 净资产 → `family-net-worth.repository.upsert`）、`getFamilyCurve({familyId, from, to})`（读快照 + 缺失回填，沿用 Phase 1 `backfillHistory` 思路）；**改 `net-worth.service.ts` 的 `refreshSnapshots` 钩子**：个人快照刷新后 best-effort 顺刷调用者所在家庭的快照（try/catch，不阻塞个人记账，沿用 Phase 1 best-effort 范式）（data-model.md §2.3 / research.md 决策2 / contracts/api.md §3.2 / 依赖 T008、T016）。
- [X] T018 [P] [US1] 扩展 `src/app/api/finance/_lib/validation.ts`：`createFamilySchema`(name 必填、defaultCurrency?)、`updateFamilySchema`、`addMemberSchema`(displayName 必填、role ∉ self/joint、userId? )、`familyNetWorthViewSchema`(view?: high|all)、`curveRangeSchema`(from/to)（contracts/api.md §1/§3）。
- [X] T019 [P] [US1] 扩展 `src/app/api/finance/_lib/serialize.ts`：`toFamilyDto`(含 memberCount)、`toFamilyMemberDto`、`toFamilyNetWorthDto`(含 memberBreakdown)，金额 string、日期 ISO（contracts/api.md §0.3）。
- [X] T020 [P] [US1] 新增 `src/app/api/finance/families/route.ts`(POST 建 / GET 我的) 与 `families/[id]/route.ts`(GET 详情+成员 / PATCH 仅 self / DELETE 仅 self)；`requireUserId` + `requireFamilyMembership`（GET/PATCH/DELETE）+ Zod + → service + 错误映射（403 FORBIDDEN、422 INVARIANT、404）（contracts/api.md §1 / 依赖 T009）。
- [X] T021 [P] [US1] 新增 `families/[id]/members/route.ts`(POST 加成员 / GET 列表) 与 `families/[id]/net-worth/route.ts`(GET 今日 + memberBreakdown) 与 `families/[id]/net-worth/curve/route.ts`(GET 区间)（contracts/api.md §2.1/§3 / 依赖 T009、T016、T017）。
- [X] T022 [P] [US1] 扩展 `src/features/finance/api.ts`：`FamilyDTO`/`FamilyMemberDTO`/`FamilyNetWorthDTO`/`CurvePointDTO` 类型 + `listMyFamilies`/`createFamily`/`getFamily`/`updateFamily`/`dissolveFamily`/`addMember`/`getFamilyNetWorth`/`getFamilyCurve` 客户端方法。
- [X] T023 [US1] 扩展 `src/features/finance/hooks/use-finance.ts`：`useMyFamilies`/`useCreateFamily`/`useFamily`/`useAddMember`/`useFamilyNetWorth`/`useFamilyCurve`（TanStack Query，`onSuccess` 失效 `['finance','families']`/`['finance','family-net-worth']`）。
- [X] T024 [US1] 新增 `src/features/finance/components/FamilySetup.tsx`（无家庭时「创建/加入家庭」入口）、`FamilyDashboard.tsx`（合并净资产 + memberBreakdown 拆分 + 家庭曲线）、`ViewSwitcher.tsx`（个人/家庭切换，Zustand 局部状态 + 读 `member.defaultView` 作默认；切换瞬时无串扰，SC-005）。沿用 frontend-dev 规范（MUI v7、sx 优先、react-i18next）。
- [X] T025 [US1] 集成测试（门控）`tests/finance/family-net-worth.service.test.ts`：两成员各自 shared 账号 → 家庭 live 净资产 = A+B、memberBreakdown 正确（SC-001/I1）；曲线 = Σ 成员；私有账号不并入（I2，先置占位，US3 补全）；非成员 → 403（I3/SC-003）（依赖 T016、T017）。

**Checkpoint**: 家庭 CRUD + 成员管理 + 合并净资产 + 曲线；家庭=Σ成员（SC-001）、切换无串扰（SC-005）、越权 403（SC-003）。MVP 可独立验收。

---

## Phase 4: User Story 2 - 知道这笔钱是谁花、谁赚的 (Priority: P2)

**Goal**: 每笔交易可标记归属成员（memberId：谁花/谁赚，含「共同/joint」），按成员汇总收支/结余/主要消费分类，呈现成员支出画像；共同消费计入家庭合计、不计入任何个人（FR-002/FR-004，I6）。
**Independent Test**: 多笔交易分别标记不同成员 → 各成员 income/expense/surplus/topCategories 正确；标记 joint → 计入家庭合计、不出现在任何个人画像。

### Tests for User Story 2（先写测试、确保失败再实现）

- [ ] T026 [P] [US2] 集成测试（门控）`tests/finance/family-attribution.service.test.ts` 骨架：按 memberId 聚合收支画像；joint 不计入个人画像（I6）；memberId 必属调用者家庭（伪造他人家庭 memberId → 拒绝）。先写、待实现后转绿。

### Implementation for User Story 2

- [ ] T027 [US2] 改 `src/services/finance/ledger.service.ts`：`CreateTransactionInput`（:59）增 `memberId?: string`，透传至事务内 transactions 插入（:213）；**校验 memberId 属于调用者所在 active 家庭**（否则抛 `ShareScopeError`→403 / `LedgerInvariantError`→422，防伪造归属）；`editTransaction`/`patchTransaction` 同步携带 memberId（data-model.md §3.1 / contracts/api.md §6 / 依赖 T003、T009）。
- [ ] T028 [US2] 新增 `src/services/finance/family-attribution.service.ts` 的 `getMemberProfile({familyId, userId, memberId, from, to})`：聚合 `transactions.memberId = memberId`（income/expense/surplus + 按 categoryId 的 topCategories）；joint memberId → 聚合所有 joint 交易（家庭合计语义，不计入个人）；调用者须为家庭成员（`requireFamilyMembership`）。**归属口径与账号 owner 正交**（research.md 决策4）（FR-004 / contracts/api.md §4.1 / 依赖 T009）。
- [ ] T029 [P] [US2] 扩展 `_lib/validation.ts`：`memberProfileQuerySchema`(from/to 可选)、`updateMemberSchema`(displayName?/role?/shareMode?/defaultView?，role ∉ self/joint)；`_lib/serialize.ts`：`toMemberProfileDto`（contracts/api.md §2.2/§4.1）。
- [ ] T030 [P] [US2] 新增 `families/[id]/members/[memberId]/route.ts`（PATCH 改 displayName/role/shareMode/defaultView；**DELETE 退出**留 US3 实现占位）与 `families/[id]/members/[memberId]/profile/route.ts`（GET 画像）；`requireUserId` + `requireFamilyMembership` + Zod + 错误映射（contracts/api.md §2.2/§4.1 / 依赖 T009）。
- [ ] T031 [P] [US2] 扩展 `features/finance/api.ts`：`MemberProfileDTO` + `getMemberProfile`/`updateMember`；交易 create/update DTO 增 `memberId?`。
- [ ] T032 [US2] 扩展既有交易录入 UI（`src/features/finance/components/` 记账表单）：增「归属成员」选择器（当前用户家庭的 active 成员，含 joint 选项，可选）；新增 `MemberProfile.tsx`（成员收支/结余/分类画像）。
- [ ] T033 [US2] 集成测试（门控）追加 `family-attribution.service.test.ts`：memberId 聚合收支正确、joint 不入个人画像（I6）、退出后历史 memberId 保留（I4 / SC-004 占位）（依赖 T027、T028）。

**Checkpoint**: 交易可标 memberId（含 joint）、成员支出画像正确、joint 不双计（FR-002/FR-004/I6）。

---

## Phase 5: User Story 3 - 我的私房钱只有我自己能看 (Priority: P3)

**Goal**: 账户可标记「仅个人/private」→ 家庭合并视图中 100% 不可见、不并入家庭净资产；越权访问他人私有数据 100% 被拒；成员退出后个人数据完整、不再并入家庭、历史家庭报表以快照保留（FR-005/FR-006/FR-007，SC-002/SC-003/SC-004）。
**Independent Test**: 账户标 private → 家庭净资产/曲线不含该账户，仅个人视图可见；非成员访问家庭端点 → 403；成员退出 → 其数据完整、家庭不再并入、历史家庭快照保留。

### Tests for User Story 3（先写测试、确保失败再实现）

- [ ] T034 [P] [US3] 集成测试（门控）追加 `tests/finance/family-net-worth.service.test.ts`：账户 `visibility='private'` → 家庭 live 净资产/曲线 100% 不含（I2/SC-002）；私有数据物理上不出现在家庭端点响应（C2）；成员退出后家庭不再并入其数据、个人数据完整、历史快照保留（I4/SC-004）。先写、待实现后转绿。

### Implementation for User Story 3

- [ ] T035 [US3] 账号可见性写入与硬过滤：account service/repository 的 create/update 接受 `visibility`；**确认 `computeFamilyNetWorthLive`（T016）与家庭快照（T017）只聚合 `visibility='shared'` 账号**（隐私硬过滤，I2/SC-002）；改 `src/app/api/finance/accounts/[id]/route.ts` PATCH 接受 `visibility`，切换后 best-effort 刷新所属家庭快照；accounts 列表/详情响应含 `visibility`（data-model.md §3.2 / contracts/api.md §5 / 依赖 T005、T016、T017）。
- [ ] T036 [US3] 新增 `family.service.ts` 的 `leaveFamily({familyId, userId, memberId})`：**软删除**（status→left、leftAt=now）；**拒绝 joint 行退出**；不动其个人数据、不清交易 memberId（ON DELETE SET NULL 不触发，因不删行）；返回 member(status=left)。补全 `families/[id]/members/[memberId]/route.ts` 的 DELETE 处理器（FR-007/SC-004 / contracts/api.md §2.3 / research.md 决策6 / 依赖 T030、T007）。
- [ ] T037 [P] [US3] 扩展 `_lib/validation.ts`：`accountVisibilitySchema`(shared|private)；`_lib/serialize.ts`：account DTO 含 `visibility`（contracts/api.md §5）。
- [ ] T038 [P] [US3] 前端：账号设置/编辑 UI 增「共享 / 仅个人」可见性开关（私有时提示「家庭视图不可见」）；`features/finance/api.ts` 增 `updateAccountVisibility`；`use-finance.ts` 增 `useLeaveFamily`/`useUpdateAccountVisibility`（失效 family-net-worth/accounts）。
- [ ] T039 [US3] 集成测试（门控）全量验收：private 排除（I2/SC-002）、越权 403（I3/SC-003）、退出隔离 + 历史快照保留（I4/SC-004）、家庭=Σ shared（I1/SC-001 回归）（依赖 T035、T036）。

**Checkpoint**: 隐私边界完整——私有 100% 不可见/不并入（SC-002）、越权 100% 拒绝（SC-003）、退出数据完整+快照保留（SC-004）。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 端到端验收、质量门、错误处理与隔离核对、默认视图与切换体验。

- [ ] T040 [P] 类型与质量门：`pnpm type-check` + `pnpm check`（type-check + lint）全绿，无 `any` 残留（`.claude/rules/typescript.md`）。
- [ ] T041 [P] 测试全绿：`pnpm test --run --silent='passed-only' 'finance'`（含 005 纯函数 `family-aggregate` 始终运行 + 门控集成 `family.*`；Phase 0–3 既有测试无回归）。纯函数测试不得依赖 `FINANCE_INTEGRATION_TEST`。
- [ ] T042 [P] SC 验收清单：按 `quickstart.md §6` 逐项核对 SC-001（家庭=Σ成员）/SC-002（私有不可见）/SC-003（越权 403）/SC-004（退出+快照）/SC-005（切换无串扰）。
- [ ] T043 [P] 错误处理与隔离核对：所有家庭路由 `requireUserId` + `requireFamilyMembership`；越权 → 403 FORBIDDEN（不泄漏存在性，私有数据物理不出现在响应 C2）；joint 不可删/退 → 422 INVARIANT；金额字符串/内部 cents；写操作单事务 + best-effort `refreshSnapshots`（contracts/api.md §0 / research.md 决策9）。
- [ ] T044 [P] 默认视图与切换：`member.defaultView` 持久化（PATCH）+ 客户端 ViewSwitcher 读默认值；切换瞬时、无数据串扰（SC-005/FR-008）；家庭相关文案接入 react-i18next（zh-CN）。
- [ ] T045 [P] 文档与 README：更新 `src/features/finance/README.md`（家庭维度说明：两套聚合口径、共享/私有、退出语义）与 `specs/005-family-finance/` 交叉引用（quickstart.md §10）。

---

## Dependencies & Execution Order

### Phase 依赖
- Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3-5 (用户故事) → Phase 6 (Polish)。
- Phase 2 的 schema/迁移（T003–T006）阻塞**所有**故事；`requireFamilyMembership`（T009）阻塞所有家庭端点；纯函数 `sumMemberNetWorth`（T010）阻塞 US1 聚合。

### User Story 依赖
- **US1 → US2 → US3**（建议顺序）：
  - US1 建家庭/成员模型 + 合并净资产（地基）；US2/US3 均依赖家庭与成员表（T003）与鉴权（T009）。
  - US2 的 memberId 透传（T027）依赖 accounts/transactions 改列（T005）；成员画像依赖家庭成员存在（US1）。
  - US3 的私有过滤依赖家庭聚合已实现（T016/T017，属 US1）；退出语义依赖成员路由（T030，属 US2）。
- US2 与 US3 在 US1 完成后可部分并行（US2 改 ledger/attribution，US3 改 account visibility/leave，文件交集少），但 `members/[memberId]/route.ts` 被 US2(T030) 创建、US3(T036) 扩展 DELETE → 该文件串行。

### 各故事内部顺序
先写测试（fail）→ repository/纯函数 → service → validation/serialize → API 路由 → 前端 DTO/hooks → 组件 → 集成测试（pass）。

### 并行机会
- Foundational：T004/T005（独立 schema 改动）、T007/T008/T009/T010（独立 repository/auth/纯函数）可并行（T003 先行，因 T005/T007/T009 依赖 families 表）。
- US1：T018/T019/T020/T021/T022（validation/serialize/路由/DTO 并行）。
- US2：T029/T031（validation+路由）并行。
- US3：T037/T038（validation+前端）并行。
- US2 与 US3 在 US1 完成后可分两人并行（避开共享的 `members/[memberId]/route.ts`）。

---

## Parallel Example: User Story 1

```bash
# 先串行写 service 内核（共享 family.service.ts / family-net-worth.service.ts，避免冲突）
# T013 createFamily → T014 list/get/update/dissolve → T015 addMember
# T016 computeFamilyNetWorthLive → T017 家庭快照+曲线+refreshSnapshots 钩子

# 随后并行外围（不同文件）
# T011 family-aggregate.test.ts（纯函数，始终运行）
# T018 validation.ts（family schemas）
# T019 serialize.ts（family DTOs）
# T020 families/route.ts + [id]/route.ts + members/route.ts
# T021 net-worth/route.ts + net-worth/curve/route.ts
# T022 features/api.ts（family DTO + 方法）
# 串行收尾：T023 hooks → T024 FamilySetup/FamilyDashboard/ViewSwitcher → T025 集成测试（门控）
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
仅交付 US1（T001–T025）：家庭/成员管理 + 合并净资产 + 曲线 + 视图切换（SC-001/SC-005）+ 越权 403（SC-003）。复用 Phase 0/1 既有记账与净资产纯函数，无外部依赖，可独立验收。这是「家庭 CFO」价值验证的最小闭环。

### Incremental Delivery
- US2：成员归属 + 支出画像（memberId 维度，含 joint）—— 复用既有交易录入流程，增量加 memberId。
- US3：隐私/共享边界（visibility=private + 成员退出）—— 隐私硬过滤与软删除，兑现信任优先（设计第 9 章）。

### Parallel Team Strategy
Foundational 由 1 人串行收口（schema/迁移不可并行冲突）；US1 由 1 人串行（service 内核共享文件）；US1 完成后，US2 与 US3 可分两人并行（避开 `members/[memberId]/route.ts`）；前端组件可与后端路由并行（先以契约 mock）。

---

## Notes

- **两套正交口径是根基**（research.md 决策4）：净资产按 owner、画像按 memberId，不可混淆——这是 SC-001（可加）与 SC-009（零双计）的构造性保证。
- **隐私硬过滤**（research.md 决策2/3）：家庭聚合**只读 `visibility='shared'` 账号**；私有账号由构造排除（I2/SC-002），无需事后过滤，响应物理不含他人私有数据（C2/SC-003）。
- **joint 用专用成员行**（research.md 决策5）：每家庭自动一条 `role='joint'`，`memberId` 保持单一外键语义，joint 计入家庭合计、不入个人画像（I6）。
- **退出软删除**（research.md 决策6）：`status='left'`，不删行、不动数据、历史快照不可变（I4/SC-004）。
- **family.repository 不继承 FinanceRepository**（单 userId 绑定与多成员聚合冲突）；家庭快照刷新挂既有 `refreshSnapshots` 钩子（best-effort，不阻塞记账）。
- ⚠️ **关键风险任务**：T016（家庭 live 聚合：逐成员 shared 账号 + 纯函数求和，隐私与可加性的交汇点）与 T017（家庭快照钩子扩展：避免与个人快照/记账事务相互阻塞）为本特性最易出错处，务必配门控集成测试（T012/T025）。
- ⚠️ **setup 脚本注意**：`setup-tasks.sh`/`setup-plan.sh` 按当前分支解析 feature（本仓库各 Phase 同居 `001-double-entry-ledger` 分支），会误指向 001；本 tasks.md 已按正确目录 `specs/005-family-finance/` 生成（见 plan.md 头部说明）。
