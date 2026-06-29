# API Contracts: 家庭财务 (Phase 4)

**Feature**: 005-family-finance · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md) · **Data Model**: [data-model.md](../data-model.md)

> Phase 1 产出。本文定义 Phase 4 对外暴露的 HTTP 契约。**沿用 finance 域既有约定**：响应体为 `{ data }` 或错误 `{ error, code, details? }`；金额一律 **string**（decimal）；日期 ISO 8601；`userId` 永远来自会话，**不得**出现在请求体；鉴权用 `_lib/auth.ts` 的 `requireUserId()`；家庭端点额外用 `_lib/family-auth.ts` 的 `requireFamilyMembership(familyId)`。

---

## 0. 通用约定

### 0.1 鉴权与权限
- 所有端点：`const authed = await requireUserId(); if (authed instanceof NextResponse) return authed;`
- 家庭端点（路径含 `families/[id]`）：随后 `const membership = await requireFamilyMembership(familyId, userId);` —— 校验 `finance_family_members(familyId, userId, status='active')`，否则 **403**。

### 0.2 错误码
| code | HTTP | 说明 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 未登录 |
| `FORBIDDEN` | 403 | 非该家庭 active 成员（**Phase 4 新增**） |
| `BAD_BODY` | 400 | 非合法 JSON |
| `VALIDATION` | 422 | Zod 校验失败（含 `details`） |
| `INVARIANT` | 422 | 业务不变量违反（如 joint 不可删、重复加入） |
| `NOT_FOUND` | 404 | 资源不存在或不属于当前用户 |
| `INTERNAL` | 500 | 服务端错误 |

错误体示例：
```json
{ "error": "无权访问该家庭数据", "code": "FORBIDDEN" }
```

### 0.3 公共 DTO 形状
```ts
// 金额一律 string
type Money = string;

interface FamilyDTO {
  id: string;
  name: string;
  createdByUserId: string;
  defaultCurrency: string;
  createdAt: string;       // ISO
  memberCount: number;     // active 成员数（含 self，不含 joint）
}

interface FamilyMemberDTO {
  id: string;              // 归属锚点（transactions.memberId 指向）
  familyId: string;
  userId: string | null;   // null = 预占槽位 / joint
  displayName: string;
  role: 'self' | 'partner' | 'child' | 'parent' | 'other' | 'joint';
  shareMode: 'shared' | 'private_by_default';
  status: 'active' | 'left';
  defaultView: 'personal' | 'family';
  joinedAt: string;
  leftAt: string | null;
}

interface NetWorthDTO {
  totalAssets: Money;
  totalLiabilities: Money;
  netWorth: Money;
  breakdown?: Record<string, Money>;          // personal: by account type
  memberBreakdown?: Record<string, Money>;    // family: by memberId
}
```

---

## 1. 家庭管理

### 1.1 `POST /api/finance/families` — 创建家庭
创建者自动成为 `role='self'` 成员；事务内自动生成 `role='joint'` 成员行。

- Auth: `requireUserId`
- Body:
```json
{ "name": "张家", "defaultCurrency": "CNY" }
```
- 201 Response:
```json
{ "family": { /* FamilyDTO */ }, "members": [ /* self 行, joint 行 */ ] }
```
- Errors: `VALIDATION`(422) 名称必填；`INVARIANT`(422) 用户已在某家庭 active（本阶段限定一人一家庭 active）。

### 1.2 `GET /api/finance/families` — 我的家庭
- Auth: `requireUserId`
- 200 Response: `{ "families": FamilyDTO[] }`（当前用户 active 成员的所有家庭；本阶段通常 ≤1）
- 注：若用户不在任何家庭，返回 `{ families: [] }`，前端据此显示「创建/加入家庭」入口。

### 1.3 `GET /api/finance/families/[id]` — 家庭详情 + 成员列表
- Auth: `requireUserId` + `requireFamilyMembership`
- 200 Response:
```json
{
  "family": { /* FamilyDTO */ },
  "members": [ /* FamilyMemberDTO[]，含 joint，status 过滤可选 ?include_left=1 */ ]
}
```
- Errors: `FORBIDDEN`(403) 非成员；`NOT_FOUND`(404)。

### 1.4 `PATCH /api/finance/families/[id]` — 更新家庭
- Auth: `requireUserId` + `requireFamilyMembership`（仅 `role='self'` 创建者可改）
- Body: `{ "name"?: string }`
- 200 Response: `{ "family": FamilyDTO }`
- Errors: `FORBIDDEN`(403) 非创建者。

### 1.5 `DELETE /api/finance/families/[id]` — 解散家庭
- Auth: `requireUserId` + 仅创建者
- 行为：软删/级联（成员 status→left、保留历史快照）。本阶段：仅创建者可解散；解散后所有成员 status='left'，家庭对当前用户不再可见。
- 200 Response: `{ "ok": true }`

---

## 2. 成员管理

### 2.1 `POST /api/finance/families/[id]/members` — 添加成员
- Auth: `requireUserId` + `requireFamilyMembership`
- Body（二选一形态）:
```json
// 形态 A：邀请已注册用户（按 userId/email）
{ "userId": "supabase-uuid", "role": "partner", "displayName": "伴侣" }
// 形态 B：预占槽位（未注册家人，仅记账归属）
{ "role": "child", "displayName": "妈妈" }
```
- 201 Response: `{ "member": FamilyMemberDTO }`
- Errors: `VALIDATION`(422) displayName 必填；`INVARIANT`(422) 该 userId 已是该家庭 active 成员；`FORBIDDEN`(403) 非成员不能邀请。
- 注：`role` 不可传 `self`/`joint`（系统保留）。

### 2.2 `PATCH /api/finance/families/[id]/members/[memberId]` — 更新成员
- Auth: `requireUserId` + `requireFamilyMembership`（本人改自己，或创建者改他人）
- Body:
```json
{ "displayName"?: string, "role"?: string, "shareMode"?: string, "defaultView"?: string }
```
- 200 Response: `{ "member": FamilyMemberDTO }`
- Errors: `INVARIANT`(422) 不能改 `role` 为 `self`/`joint`；joint 行不可改 role。

### 2.3 `DELETE /api/finance/families/[id]/members/[memberId]` — 成员退出（软删除）
- Auth: `requireUserId` + `requireFamilyMembership`
- 行为：`status='active'→'left'`，`leftAt=now`。不删行、不动其个人数据、不清交易 memberId（决策 6）。
- 200 Response: `{ "member": FamilyMemberDTO }`（status='left'）
- Errors: `INVARIANT`(422) joint 行不可退出；`FORBIDDEN`(403) 非成员。

---

## 3. 家庭净资产与曲线

### 3.1 `GET /api/finance/families/[id]/net-worth` — 家庭合并净资产（今日）
- Auth: `requireUserId` + `requireFamilyMembership`
- Query: `?view=high|all`（流动性视图，沿用 Phase 1 `deriveViewNetWorth`）
- 200 Response（含按成员拆分）:
```json
{
  "netWorth": { /* NetWorthDTO，含 memberBreakdown: { [memberId]: netWorth } */ }
}
```
- 语义：`computeFamilyNetWorthLive` = Σ active 成员的**共享账号** live 净资产（决策 2）。私有账号不并入（SC-002）。joint 行不贡献净资产（无账号）。

### 3.2 `GET /api/finance/families/[id]/net-worth/curve` — 家庭净资产曲线
- Auth: `requireUserId` + `requireFamilyMembership`
- Query: `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- 200 Response:
```json
{
  "points": [
    { "date": "2026-06-01", "netWorth": "860000.00",
      "memberBreakdown": { "<memberIdA>": "500000.00", "<memberIdB>": "360000.00" } }
  ]
}
```
- 数据源：`finance_family_net_worth_snapshots`（O(1) 读取，决策 2）。缺失日期由后端按需回填（沿用 Phase 1 `backfillHistory` 思路，口径切到家庭）。

---

## 4. 成员收支画像（归属聚合）

### 4.1 `GET /api/finance/families/[id]/members/[memberId]/profile` — 成员支出画像
- Auth: `requireUserId` + `requireFamilyMembership`
- Query: `?from=&to=`（默认当月）
- 200 Response:
```json
{
  "member": { /* FamilyMemberDTO */ },
  "profile": {
    "income": "35000.00",
    "expense": "12000.00",
    "surplus": "23000.00",
    "topCategories": [ { "categoryId": "...", "name": "餐饮", "amount": "4200.00" } ]
  }
}
```
- 语义：按 `transactions.memberId = [memberId]` 聚合（决策 4 的归属口径）。joint 成员返回「家庭合计」语义（所有 memberId=joint 交易 + 各成员）。**不**含他人私有账号数据（聚合只走 memberId，与账号 visibility 正交；但底层查询仍受成员鉴权保护）。

---

## 5. 账号可见性（既有端点扩展）

### 5.1 `PATCH /api/finance/accounts/[id]` — 增 `visibility` 字段
- Auth: `requireUserId`（账号 owner）
- Body 新增可选字段：
```json
{ "visibility": "private" }   // 或 "shared"
```
- 200 Response: `{ "account": AccountItem }`（含 visibility）
- 副作用：切换 visibility 后 best-effort 刷新所属家庭的家庭快照（若 owner 在某家庭 active）。
- 语义：`private` ⇒ 该账号不并入家庭净资产、家庭视图不可见（SC-002）。

### 5.2 既有 `GET /api/finance/accounts` — 响应增 `visibility` 字段
- 列表与详情返回的 account 对象新增 `visibility: 'shared'|'private'`，便于前端显示共享状态与切换。

---

## 6. 交易归属（既有端点扩展）

### 6.1 `POST /api/finance/transactions` / `PATCH /api/finance/transactions/[id]` — 增 `memberId`
- 请求体新增可选 `memberId: string | null`（指向 `family_members.id`，含 joint）。
- 校验：若提供 memberId，服务层校验该 member 属于**调用者所在家庭**且 `status='active'`（否则 `INVARIANT`/`FORBIDDEN`），防止伪造他人家庭成员归属。
- 响应的 transaction 对象新增 `memberId: string | null`。

---

## 7. 契约不变量（前端/测试共同遵守）

- **C1**：请求体永不含 `userId`（来自会话）。
- **C2**：所有家庭读端点返回的数据 = Σ 共享账号聚合；他人私有数据**物理上不可能**出现在响应里（SC-002/SC-003）。
- **C3**：`memberBreakdown` 的 key 是 `family_members.id`；其和 == 家庭 netWorth（扣除 joint，joint 无净资产贡献）。
- **C4**：金额 string、日期 ISO（与 Phase 0–3 一致）。
- **C5**：403 仅由家庭鉴权产生；非成员访问任何 `/families/[id]/*` → 403。
