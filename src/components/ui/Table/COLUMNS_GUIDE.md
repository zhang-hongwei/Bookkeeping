# Table 列配置指南

## 📝 Column Item 配置说明

### ✅ 简化后的列配置

**好消息！** 现在你**只需要传 `key`**，不再需要同时传 `key` 和 `dataIndex`！

### 核心原理

Table 组件内部会自动执行 `normalizeColumns()` 函数，如果你没有提供 `dataIndex`，它会自动使用 `key` 作为 `dataIndex`。

```typescript
// utils.ts 中的实现
export function normalizeColumns<T = any>(
  columns: ColumnItem<T>[]
): ColumnItem<T>[] {
  return columns.map((column) => {
    // 如果没有 dataIndex，使用 key 作为 dataIndex
    const normalizedColumn = {
      ...column,
      dataIndex: column.dataIndex || column.key,
    };

    // 递归处理子列
    if (column.children && column.children.length > 0) {
      normalizedColumn.children = normalizeColumns(column.children);
    }

    return normalizedColumn;
  });
}
```

---

## 🎯 使用方式对比

### ❌ 旧方式（冗余）

```typescript
const columns: ColumnItem[] = [
  {
    key: "name",
    dataIndex: "name",  // ❌ 重复！
    title: "Name",
    width: 150,
  },
  {
    key: "email",
    dataIndex: "email",  // ❌ 重复！
    title: "Email",
    width: 200,
  },
  {
    key: "phoneNumber",
    dataIndex: "phoneNumber",  // ❌ 重复！
    title: "Phone Number",
    width: 180,
  },
];
```

### ✅ 新方式（推荐）

```typescript
const columns: ColumnItem[] = [
  {
    key: "name",  // ✅ 只需要 key
    title: "Name",
    width: 150,
  },
  {
    key: "email",  // ✅ 只需要 key
    title: "Email",
    width: 200,
  },
  {
    key: "phoneNumber",  // ✅ 只需要 key
    title: "Phone Number",
    width: 180,
  },
];
```

---

## 🔧 高级用法

### 场景 1: key 和 dataIndex 不同

当你需要使用不同的 `key` 和 `dataIndex` 时（比如嵌套对象、计算字段等）：

```typescript
const columns: ColumnItem[] = [
  {
    key: "userFullName",        // UI 中的唯一标识
    dataIndex: "user.name",     // 数据中的实际字段路径
    title: "Full Name",
    width: 150,
  },
  {
    key: "userContact",
    dataIndex: "contactInfo.email",  // 嵌套字段
    title: "Contact",
    width: 200,
  },
];
```

### 场景 2: 使用 render 函数

```typescript
const columns: ColumnItem[] = [
  {
    key: "name",
    title: "Name",
    width: 150,
    // render 函数接收的 value 会自动从 record[dataIndex] 获取
    // 由于 dataIndex 未指定，会使用 key='name'
    render: (value, record, index) => (
      <Typography variant="body2">{value}</Typography>
    ),
  },
  {
    key: "status",
    title: "Status",
    width: 100,
    render: (value) => (
      <Chip
        label={value}
        color={value === "active" ? "success" : "default"}
      />
    ),
  },
];
```

### 场景 3: 固定列

```typescript
const columns: ColumnItem[] = [
  {
    key: "id",
    title: "ID",
    width: 80,
    fixed: "left",  // 固定在左侧
  },
  {
    key: "name",
    title: "Name",
    width: 150,
  },
  {
    key: "description",
    title: "Description",
    width: 300,
  },
  {
    key: "actions",
    title: "Actions",
    width: 150,
    fixed: "right",  // 固定在右侧
    render: (_, record) => (
      <Stack direction="row" spacing={1}>
        <IconButton size="small">
          <EditIcon />
        </IconButton>
        <IconButton size="small">
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];
```

### 场景 4: 嵌套列（多级表头）

```typescript
const columns: ColumnItem[] = [
  {
    key: "name",
    title: "Name",
    width: 150,
  },
  {
    key: "contact",
    title: "Contact Information",
    children: [
      {
        key: "email",
        title: "Email",
        width: 200,
      },
      {
        key: "phone",
        title: "Phone",
        width: 150,
      },
    ],
  },
];
```

---

## 📚 完整示例

### 基础表格示例

```typescript
import Table, { ColumnItem } from "@/components/ui/Table";

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  status: "active" | "inactive";
  createdAt: string;
}

export default function UserListPage() {
  const columns: ColumnItem<User>[] = [
    {
      key: "id",
      title: "ID",
      width: 80,
      fixed: "left",
    },
    {
      key: "name",
      title: "Name",
      width: 150,
    },
    {
      key: "email",
      title: "Email",
      width: 200,
    },
    {
      key: "phoneNumber",
      title: "Phone Number",
      width: 180,
    },
    {
      key: "status",
      title: "Status",
      width: 120,
      render: (value) => (
        <Chip
          label={value}
          color={value === "active" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      key: "createdAt",
      title: "Created At",
      width: 180,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      title: "Actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => handleEdit(record)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(record)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const dataSource: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "+1 234 567 8900",
      status: "active",
      createdAt: "2024-01-15",
    },
    // ... more data
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      height={600}
      stickyHeader
      pagination={{
        total: 100,
        currentPage: 1,
        pageSize: 10,
      }}
    />
  );
}
```

---

## 🚀 最佳实践

### 1. ✅ 简洁优先
```typescript
// ✅ 推荐：简洁明了
const columns = [
  { key: "name", title: "Name", width: 150 },
  { key: "email", title: "Email", width: 200 },
];

// ❌ 避免：不必要的重复
const columns = [
  { key: "name", dataIndex: "name", title: "Name", width: 150 },
  { key: "email", dataIndex: "email", title: "Email", width: 200 },
];
```

### 2. ✅ 类型安全
```typescript
// ✅ 推荐：使用泛型指定数据类型
interface User {
  name: string;
  email: string;
}

const columns: ColumnItem<User>[] = [
  { key: "name", title: "Name" },
  { key: "email", title: "Email" },
];
```

### 3. ✅ 语义化命名
```typescript
// ✅ 推荐：key 与数据字段名保持一致
const columns = [
  { key: "firstName", title: "First Name" },
  { key: "lastName", title: "Last Name" },
  { key: "emailAddress", title: "Email" },
];

// 对应的数据结构
interface User {
  firstName: string;
  lastName: string;
  emailAddress: string;
}
```

### 4. ✅ render 函数优化
```typescript
// ✅ 推荐：使用 useCallback 优化 render 函数
const renderStatus = useCallback((value: string) => (
  <Chip label={value} color={value === "active" ? "success" : "default"} />
), []);

const columns = [
  {
    key: "status",
    title: "Status",
    render: renderStatus,
  },
];
```

---

## 🔍 内部处理流程

### 数据流转过程

```
1. 用户定义列配置
   columns = [{ key: "name", title: "Name" }]

2. mergeSelectionAndExpandColumns() 处理
   ↓ 调用 normalizeColumns()

3. normalizeColumns() 规范化
   columns = [{ key: "name", dataIndex: "name", title: "Name" }]
   ↓ dataIndex 自动填充为 key

4. bodyRow.tsx 渲染时
   const fieldKey = column.dataIndex || column.key;  // "name"
   const value = row[fieldKey];  // row["name"]

5. 渲染单元格
   <TableCell>{value}</TableCell>
```

---

## 📖 API 参考

### ColumnItem 接口

```typescript
interface ColumnItem<T = any> {
  /**
   * 列的唯一标识符，也作为默认的 dataIndex
   * 如果不指定 dataIndex，将使用 key 作为数据字段名
   */
  key: string;

  /**
   * 数据字段名，用于从 record 中获取值
   * @default key - 如果不提供，默认使用 key 的值
   */
  dataIndex?: string;

  /** 列标题 */
  title: ReactNode;

  /** 列宽度 */
  width?: string | number;

  /** 最小宽度 */
  minWidth?: string | number;

  /** 最大宽度 */
  maxWidth?: string | number;

  /** 固定列：'left' | 'right' | boolean */
  fixed?: "left" | "right" | boolean;

  /** 对齐方式 */
  align?: "left" | "center" | "right";

  /** 是否可排序 */
  sortable?: boolean;

  /** 是否可筛选 */
  filterable?: boolean;

  /** 自定义渲染函数 */
  render?: (value: any, record: T, index: number) => ReactNode;

  /** 子列（用于多级表头） */
  children?: ColumnItem<T>[];

  /** 是否显示省略号 */
  ellipsis?: boolean;

  /** 自定义类名 */
  className?: string;

  /** 表头单元格属性 */
  onHeaderCell?: (column: ColumnItem<T>) => React.HTMLAttributes<HTMLTableCellElement>;

  /** 单元格属性 */
  onCell?: (record: T, rowIndex: number) => React.HTMLAttributes<HTMLTableCellElement>;
}
```

---

## 💡 常见问题

### Q1: 什么时候需要显式指定 dataIndex？

**A:** 在以下情况下需要显式指定 `dataIndex`：

1. **嵌套对象**: `dataIndex: "user.profile.name"`
2. **key 和字段名不一致**: `key: "userEmail", dataIndex: "email"`
3. **计算字段**: `key: "fullName", dataIndex: "firstName"` (配合 render)

### Q2: 旧代码中的 key + dataIndex 还能用吗？

**A:** 完全可以！保持向后兼容。如果你同时提供了 `key` 和 `dataIndex`，组件会优先使用 `dataIndex`。

### Q3: 性能有影响吗？

**A:** 没有。`normalizeColumns()` 只在列配置变化时执行一次，对性能影响可以忽略不计。

### Q4: TypeScript 类型检查还准确吗？

**A:** 是的！类型定义已经更新，包含了详细的 JSDoc 注释，IDE 会提供完整的类型提示。

---

## 🔗 相关文件

- **类型定义**: `./types.ts` - ColumnItem 接口定义
- **工具函数**: `./utils.ts` - normalizeColumns 实现
- **主组件**: `./index.tsx` - Table 主组件
- **渲染逻辑**: `./tableBody/bodyRow.tsx` - 单元格渲染

---

## 📝 迁移指南

### 从旧代码迁移

如果你的项目中有大量旧代码，可以按以下步骤逐步迁移：

1. **保持现状**（推荐）
   - 旧代码继续工作，不需要修改
   - 新代码使用简化写法

2. **批量迁移**
   ```bash
   # 使用 sed 批量删除冗余的 dataIndex
   # 仅作示例，实际使用需谨慎测试
   find . -name "*.tsx" -exec sed -i '' '/dataIndex: "[^"]*",$/d' {} \;
   ```

3. **手动迁移**
   - 逐个文件检查
   - 删除 `dataIndex` 等于 `key` 的情况
   - 保留 `dataIndex` 不等于 `key` 的情况

---

**更新日期**: 2024-10-23
**维护者**: Table 组件开发团队
