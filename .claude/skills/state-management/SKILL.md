---
name: state-management
version: 1.0.0
description: Zustand 状态管理最佳实践
priority: medium
dependencies: []
triggers:
  keywords: [zustand, store, state, global state, 状态, 状态管理, 全局状态]
  files: ["store/**/*.ts", "**/*store.ts"]
  intents: ["create store", "manage state", "update state"]
---

# State Management Skill

> Zustand 状态管理模式、Slice 组织和最佳实践

> ⚠️ **重要提示**：本规范为项目状态管理标准，替代 `.claude/rules/zustand-*.md`。如有冲突，以本文件为准。

## 🎯 核心原则

### Zustand Store 特点
- 轻量级、无样板代码
- TypeScript 原生支持
- DevTools 集成
- 灵活的中间件系统

## 📦 Store 组织结构

### 单一 Store（简单应用）

```typescript
// src/store/useAppStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  count: number;
  user: User | null;

  // Actions
  increment: () => void;
  setUser: (user: User) => void;
}

export const useAppStore = create<AppState>()(
  devtools((set, get) => ({
    // Initial state
    count: 0,
    user: null,

    // Actions
    increment: () => set((state) => ({ count: state.count + 1 })),
    setUser: (user) => set({ user }),
  }))
);
```

### Slice 模式（复杂应用）

```
src/store/
├── chat/
│   ├── store.ts              # 主 store 文件
│   ├── initialState.ts       # 聚合所有 slice 的初始状态
│   ├── selectors.ts          # 聚合所有 selector
│   └── slices/
│       ├── message/
│       │   ├── initialState.ts
│       │   ├── action.ts
│       │   ├── selectors.ts
│       │   └── reducer.ts    # 可选
│       └── topic/
│           ├── initialState.ts
│           ├── action.ts
│           └── selectors.ts
```

## 🔧 Slice 实现模式

### 1. 定义 Slice State

```typescript
// slices/user/initialState.ts
export interface UserState {
  currentUser: User | null;
  users: User[];
  usersLoading: boolean;
}

export const initialUserState: UserState = {
  currentUser: null,
  users: [],
  usersLoading: false,
};
```

### 2. 定义 Slice Actions

```typescript
// slices/user/action.ts
import { StateCreator } from 'zustand';
import { userService } from '@/services/user.service';

export interface UserAction {
  // Public actions
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;

  // Internal actions
  internal_setUsers: (users: User[]) => void;
  internal_setLoading: (loading: boolean) => void;
}

export const createUserSlice: StateCreator<
  UserState & UserAction,
  [],
  [],
  UserAction
> = (set, get) => ({
  fetchUsers: async () => {
    set({ usersLoading: true });
    try {
      const users = await userService.getAll();
      set({ users, usersLoading: false });
    } catch (error) {
      set({ usersLoading: false });
      throw error;
    }
  },

  updateUser: async (id, data) => {
    await userService.update(id, data);
    // 刷新数据
    await get().fetchUsers();
  },

  internal_setUsers: (users) => set({ users }),
  internal_setLoading: (loading) => set({ usersLoading: loading }),
});
```

### 3. 定义 Selectors

```typescript
// slices/user/selectors.ts
import { AppStoreState } from '../../initialState';

const currentUser = (s: AppStoreState) => s.currentUser;
const isLoading = (s: AppStoreState) => s.usersLoading;
const getUserById = (id: string) => (s: AppStoreState) =>
  s.users.find((u) => u.id === id);

// 聚合导出（重要）
export const userSelectors = {
  currentUser,
  isLoading,
  getUserById,
};
```

### 4. 聚合到主 Store

```typescript
// store.ts
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { createUserSlice, UserAction } from './slices/user/action';
import { createMessageSlice, MessageAction } from './slices/message/action';
import { initialUserState, UserState } from './slices/user/initialState';
import { initialMessageState, MessageState } from './slices/message/initialState';

type AppStore = UserState & UserAction & MessageState & MessageAction;

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    devtools((...args) => ({
      ...initialUserState,
      ...initialMessageState,
      ...createUserSlice(...args),
      ...createMessageSlice(...args),
    }))
  )
);
```

## 📋 Action 组织模式

### Public vs Internal Actions

```typescript
interface ChatActions {
  // Public Actions - 供组件调用
  createMessage: (content: string) => Promise<void>;
  updateMessage: (id: string, content: string) => Promise<void>;

  // Internal Actions - 内部实现（使用 internal_ 前缀）
  internal_createMessage: (message: Message) => Promise<string>;
  internal_dispatchMessage: (action: MessageAction) => void;
  internal_toggleLoading: (loading: boolean, id?: string) => void;
}
```

### 命名规范

- **Public Actions**: 动词形式
  - `createUser`, `updateProfile`, `sendMessage`
- **Internal Actions**: `internal_` + 动词
  - `internal_createUser`, `internal_updateState`
- **Dispatch Methods**: `internal_dispatch` + 实体名
  - `internal_dispatchMessage`, `internal_dispatchTopic`
- **Toggle Methods**: `internal_toggle` + 状态名
  - `internal_toggleLoading`, `internal_toggleEditing`

## 🔄 状态更新模式

### 简单 set（推荐用于简单状态）

```typescript
interface AppState {
  count: number;
  theme: 'light' | 'dark';

  increment: () => void;
  toggleTheme: () => void;
}

const store = create<AppState>((set, get) => ({
  count: 0,
  theme: 'light',

  increment: () => set((state) => ({ count: state.count + 1 })),
  toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
}));
```

### Reducer 模式（用于复杂状态）

```typescript
// reducer.ts
import { produce } from 'immer';

interface AddMessageAction {
  type: 'addMessage';
  value: Message;
}

interface UpdateMessageAction {
  type: 'updateMessage';
  id: string;
  value: Partial<Message>;
}

type MessageDispatch = AddMessageAction | UpdateMessageAction;

export const messageReducer = (
  state: Message[],
  action: MessageDispatch
): Message[] => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'addMessage':
        draft.push(action.value);
        break;
      case 'updateMessage':
        const index = draft.findIndex((m) => m.id === action.id);
        if (index >= 0) {
          draft[index] = { ...draft[index], ...action.value };
        }
        break;
    }
  });
};

// 在 action 中使用
internal_dispatchMessage: (action) => {
  const nextMessages = messageReducer(get().messages, action);
  set({ messages: nextMessages });
},
```

## ⚡ 乐观更新模式

### 创建操作

```typescript
createMessage: async (content: string) => {
  const tempId = `temp-${Date.now()}`;

  // 1. 乐观更新 - 立即显示
  get().internal_dispatchMessage({
    type: 'addMessage',
    value: { id: tempId, content, createdAt: new Date(), optimistic: true },
  });

  // 2. 调用后端
  try {
    const realId = await messageService.create({ content });

    // 3. 替换临时 ID
    get().internal_dispatchMessage({
      type: 'updateMessage',
      id: tempId,
      value: { id: realId, optimistic: false },
    });

    return realId;
  } catch (error) {
    // 4. 失败时标记错误
    get().internal_dispatchMessage({
      type: 'updateMessage',
      id: tempId,
      value: { error: true, errorMessage: error.message },
    });
    throw error;
  }
},
```

### 更新操作

```typescript
updateMessage: async (id: string, content: string) => {
  const prevMessage = get().messages.find((m) => m.id === id);

  // 1. 乐观更新
  get().internal_dispatchMessage({
    type: 'updateMessage',
    id,
    value: { content },
  });

  // 2. 调用后端
  try {
    await messageService.update(id, { content });
    // 刷新确保一致性（可选）
    await get().refreshMessages();
  } catch (error) {
    // 3. 回滚到之前状态
    if (prevMessage) {
      get().internal_dispatchMessage({
        type: 'updateMessage',
        id,
        value: prevMessage,
      });
    }
    throw error;
  }
},
```

### 删除操作（不使用乐观更新）

```typescript
deleteMessage: async (id: string) => {
  // 1. 显示加载状态
  get().internal_toggleLoading(true, id);

  try {
    // 2. 直接调用后端
    await messageService.delete(id);

    // 3. 刷新数据
    await get().refreshMessages();
  } finally {
    // 4. 清除加载状态
    get().internal_toggleLoading(false, id);
  }
},
```

## 🎨 加载状态管理

### 数组式加载状态（推荐）

```typescript
interface AppState {
  messageLoadingIds: string[];

  internal_toggleLoading: (loading: boolean, id: string) => void;
}

// 工具函数
function toggleBooleanList(list: string[], id: string, add: boolean): string[] {
  if (add) {
    return list.includes(id) ? list : [...list, id];
  } else {
    return list.filter((item) => item !== id);
  }
}

// 使用
internal_toggleLoading: (loading, id) => {
  set({
    messageLoadingIds: toggleBooleanList(get().messageLoadingIds, id, loading),
  });
},
```

### 在组件中使用

```tsx
function MessageItem({ id }: { id: string }) {
  const isLoading = useAppStore((s) => s.messageLoadingIds.includes(id));

  return (
    <div>
      {isLoading && <Spinner />}
      {/* 消息内容 */}
    </div>
  );
}
```

## 🎯 Selector 最佳实践

### 基础 Selector

```typescript
// 使用 selector
const user = useAppStore((s) => s.currentUser);

// 避免不必要的重渲染 - 使用 shallow
import { shallow } from 'zustand/shallow';

const { users, isLoading } = useAppStore(
  (s) => ({ users: s.users, isLoading: s.usersLoading }),
  shallow
);
```

### 计算型 Selector

```typescript
// 在 selectors.ts 中定义
const activeMessages = (s: AppState) =>
  s.messages.filter((m) => m.userId === s.currentUserId);

const unreadCount = (s: AppState) =>
  s.messages.filter((m) => !m.read).length;

export const messageSelectors = {
  activeMessages,
  unreadCount,
};

// 在组件中使用
const activeMessages = useAppStore(messageSelectors.activeMessages);
```

## 📚 更多资源

需要更详细的指南？查看 `resources/` 目录：
- `action-patterns.md` - Action 组织详细模式
- `slice-organization.md` - Slice 架构完整指南
- `optimistic-updates.md` - 乐观更新深入解析
- `swr-integration.md` - 与 SWR 集成模式

## ✅ 最佳实践总结

### 1. 何时使用 Reducer
- ✅ 复杂列表/映射数据
- ✅ 需要乐观更新
- ✅ 状态转换逻辑复杂
- ❌ 简单布尔值/字符串

### 2. 乐观更新策略
- ✅ 创建、更新操作
- ❌ 删除操作（使用加载状态）

### 3. 命名规范
- Public actions: 动词形式
- Internal actions: `internal_` 前缀
- Selectors: 聚合导出 `xxxSelectors`

### 4. 状态结构
- 扁平化状态
- Map 结构管理关联数据
- 数组管理加载状态

### 5. TypeScript
- 为每个 slice 定义接口
- 使用 StateCreator 确保类型安全
- 导出 selector 时保持类型
