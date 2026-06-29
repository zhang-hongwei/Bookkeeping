# Schema 设计模式

> Drizzle ORM + PostgreSQL Schema 设计最佳实践

## 📋 目录

- [命名规范](#命名规范)
- [字段类型选择](#字段类型选择)
- [主键策略](#主键策略)
- [关系设计](#关系设计)
- [索引策略](#索引策略)
- [约束设计](#约束设计)
- [时间戳字段](#时间戳字段)
- [软删除模式](#软删除模式)
- [常见设计模式](#常见设计模式)

---

## 命名规范

### 表名规范

```typescript
// ✅ 推荐：snake_case 复数形式
export const mealRecords = pgTable('meal_records', { ... });
export const users = pgTable('users', { ... });
export const orderItems = pgTable('order_items', { ... });

// ❌ 避免：单数或驼峰命名
export const mealRecord = pgTable('mealRecord', { ... });
export const User = pgTable('User', { ... });
```

### 字段命名规范

```typescript
export const users = pgTable('users', {
  // ✅ 数据库列名：snake_case
  // ✅ TypeScript 字段名：camelCase
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  emailAddress: varchar('email_address', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }),

  // 布尔字段：使用 is/has 前缀
  isActive: boolean('is_active').default(true),
  hasVerified: boolean('has_verified').default(false),

  // 时间戳字段
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### 关系字段命名

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // ✅ 外键命名：{关联表单数}Id
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  categoryId: uuid('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),
});

// 关联表命名
export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').references(() => users.id),
  roleId: uuid('role_id').references(() => roles.id),
});
```

---

## 字段类型选择

### 文本类型

```typescript
export const articles = pgTable('articles', {
  // varchar: 固定最大长度的短文本（带索引）
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique(),

  // text: 不限长度的长文本（无需索引）
  content: text('content'),
  description: text('description'),

  // 枚举类型：使用 varchar 配合验证
  status: varchar('status', { length: 20 })
    .notNull()
    .default('draft'), // draft, published, archived
});

// Zod 验证枚举
export const insertArticleSchema = createInsertSchema(articles, {
  status: z.enum(['draft', 'published', 'archived']),
});
```

### 数值类型

```typescript
export const products = pgTable('products', {
  // integer: 整数（-2147483648 到 2147483647）
  stockQuantity: integer('stock_quantity').default(0),
  viewCount: integer('view_count').default(0),

  // bigint: 大整数（需要处理 JS 精度问题）
  totalSales: bigint('total_sales', { mode: 'number' }).default(0),

  // decimal/numeric: 精确小数（金融、科学计算）
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  weight: decimal('weight', { precision: 8, scale: 3 }), // kg

  // real/double: 浮点数（性能优先，容忍精度损失）
  rating: real('rating').default(0), // 0.0 - 5.0
});

// 金额处理：以分为单位存储
export const orders = pgTable('orders', {
  // ✅ 推荐：使用 integer 存储分
  totalAmountCents: integer('total_amount_cents').notNull(), // 9999 = $99.99

  // 或使用 bigint 处理大额
  totalAmountCents2: bigint('total_amount_cents2', { mode: 'number' }),
});

// 使用示例
const order = {
  totalAmountCents: Math.round(99.99 * 100), // 9999
};
```

### 布尔类型

```typescript
export const users = pgTable('users', {
  // boolean: 使用 is/has 前缀
  isActive: boolean('is_active').default(true),
  hasVerifiedEmail: boolean('has_verified_email').default(false),
  isAdmin: boolean('is_admin').default(false),

  // 如需三态（true/false/null），不设默认值
  emailMarketingConsent: boolean('email_marketing_consent'), // null = 未询问
});
```

### 日期时间类型

```typescript
export const events = pgTable('events', {
  // timestamp: 完整日期时间（推荐）
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // timestamp with timezone: 带时区
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),

  // date: 仅日期（无时间）
  birthDate: date('birth_date'),

  // time: 仅时间（无日期）
  openingTime: time('opening_time'), // "09:00:00"
});
```

### JSON 类型

```typescript
export const settings = pgTable('settings', {
  // jsonb: 二进制 JSON（推荐，支持索引和查询）
  metadata: jsonb('metadata').$type<{
    theme: string;
    locale: string;
    preferences: Record<string, any>;
  }>(),

  // 数组类型
  tags: jsonb('tags').$type<string[]>().default([]),

  // 复杂对象
  config: jsonb('config').$type<{
    notifications: {
      email: boolean;
      push: boolean;
    };
    privacy: {
      profileVisible: boolean;
      searchable: boolean;
    };
  }>().notNull(),
});

// 使用示例
const setting = {
  metadata: {
    theme: 'dark',
    locale: 'zh-CN',
    preferences: { fontSize: 14 },
  },
  tags: ['featured', 'popular'],
  config: {
    notifications: { email: true, push: false },
    privacy: { profileVisible: true, searchable: true },
  },
};
```

---

## 主键策略

### UUID 主键（推荐）

```typescript
// ✅ 推荐：UUID v4 随机生成
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
});

// 优点：
// - 分布式友好，无需中心化 ID 生成
// - 安全性高，难以猜测
// - 合并数据库无冲突
// - 可在应用层生成

// 缺点：
// - 存储空间较大（16 字节 vs 4/8 字节）
// - 索引性能略低于自增 ID
// - 不适合排序（如需按创建时间排序，需额外字段）
```

### 自增 ID

```typescript
// serial/bigserial: 自增整数
export const logs = pgTable('logs', {
  id: serial('id').primaryKey(), // 1, 2, 3...
});

// 优点：
// - 存储空间小
// - 查询性能高
// - 自然排序

// 缺点：
// - 不适合分布式环境
// - ID 可预测（安全风险）
// - 迁移/合并数据困难
```

### 复合主键

```typescript
// 多对多关联表
export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
}, (table) => ({
  // 复合主键
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));
```

---

## 关系设计

### 一对多关系

```typescript
// 用户 -> 文章（一对多）
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }),

  // 外键指向 users
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

// Relations 定义
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
```

### 多对多关系

```typescript
// 学生 <-> 课程（多对多）
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
});

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
});

// 关联表
export const studentCourses = pgTable('student_courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),

  // 额外字段
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  grade: integer('grade'), // 成绩
  status: varchar('status', { length: 20 }).default('active'),
}, (table) => ({
  // 唯一约束：同一学生不能重复选同一课程
  unq: unique().on(table.studentId, table.courseId),
}));

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  enrollments: many(studentCourses),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(studentCourses),
}));

export const studentCoursesRelations = relations(studentCourses, ({ one }) => ({
  student: one(students, {
    fields: [studentCourses.studentId],
    references: [students.id],
  }),
  course: one(courses, {
    fields: [studentCourses.courseId],
    references: [courses.id],
  }),
}));
```

### 自引用关系

```typescript
// 树形结构（分类）
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),

  // 父分类 ID
  parentId: uuid('parent_id').references((): any => categories.id, {
    onDelete: 'cascade',
  }),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'parent',
  }),
  children: many(categories, { relationName: 'parent' }),
}));

// 查询示例
const categoryWithChildren = await db.query.categories.findFirst({
  where: eq(categories.id, categoryId),
  with: {
    children: true,
    parent: true,
  },
});
```

### onDelete 策略

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // CASCADE: 删除用户时删除所有文章
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // SET NULL: 删除分类时文章分类设为 null
  categoryId: uuid('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),

  // RESTRICT: 删除用户时如果有文章则阻止（默认）
  authorId: uuid('author_id')
    .references(() => users.id, { onDelete: 'restrict' }),

  // NO ACTION: 类似 RESTRICT，但在事务末尾检查
  editorId: uuid('editor_id')
    .references(() => users.id, { onDelete: 'no action' }),
});
```

---

## 索引策略

### 单字段索引

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }),
  status: varchar('status', { length: 20 }),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // 普通索引：加速查询
  userIdIdx: index('posts_user_id_idx').on(table.userId),
  statusIdx: index('posts_status_idx').on(table.status),
  createdAtIdx: index('posts_created_at_idx').on(table.createdAt),

  // 唯一索引：保证唯一性 + 加速查询
  slugIdx: uniqueIndex('posts_slug_idx').on(table.slug),
}));
```

### 复合索引

```typescript
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  status: varchar('status', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // 复合索引：注意字段顺序
  // ✅ 可用于：
  // - WHERE user_id = ? AND status = ?
  // - WHERE user_id = ?
  // ❌ 不适用于：
  // - WHERE status = ? （无法使用索引）
  userStatusIdx: index('orders_user_status_idx')
    .on(table.userId, table.status),

  // 包含排序字段的复合索引
  userCreatedIdx: index('orders_user_created_idx')
    .on(table.userId, table.createdAt.desc()),
}));

// 最佳实践：索引字段顺序
// 1. 等值查询字段（WHERE col = ?）
// 2. 范围查询字段（WHERE col > ?）
// 3. 排序字段（ORDER BY col）
```

### 部分索引（条件索引）

```typescript
// PostgreSQL 支持部分索引（需使用原生 SQL）
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status', { length: 20 }),
  publishedAt: timestamp('published_at'),
}, (table) => ({
  // 仅为已发布文章创建索引
  publishedIdx: index('posts_published_idx')
    .on(table.publishedAt)
    .where(sql`${table.status} = 'published'`),
}));
```

### 索引选择指南

```typescript
// ✅ 应该创建索引的场景
// 1. 外键字段
userId: uuid('user_id').references(() => users.id),
// -> index on userId

// 2. 频繁查询的字段
status: varchar('status', { length: 20 }),
// -> index on status

// 3. 唯一约束
email: varchar('email', { length: 255 }).unique(),
// -> unique index on email

// 4. 排序字段
createdAt: timestamp('created_at').defaultNow(),
// -> index on createdAt

// ❌ 不应该创建索引的场景
// 1. 小表（< 1000 行）
// 2. 低基数字段（boolean，除非配合其他字段）
// 3. 频繁更新的字段
// 4. 大文本字段（text）
```

---

## 约束设计

### 唯一约束

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // ✅ 单字段唯一
  email: varchar('email', { length: 255 }).unique().notNull(),

  // ✅ 命名唯一约束
  username: varchar('username', { length: 50 }),
}, (table) => ({
  usernameUnq: unique('users_username_unq').on(table.username),

  // 复合唯一约束
  emailProviderUnq: unique('users_email_provider_unq')
    .on(table.email, table.provider),
}));
```

### NOT NULL 约束

```typescript
export const products = pgTable('products', {
  // ✅ 必填字段使用 notNull()
  name: varchar('name', { length: 255 }).notNull(),
  price: integer('price').notNull(),

  // ✅ 可选字段不加 notNull()
  description: text('description'),
  discountPrice: integer('discount_price'),
});
```

### CHECK 约束

```typescript
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  price: integer('price').notNull(),
  discountPrice: integer('discount_price'),
  rating: integer('rating'),
}, (table) => ({
  // 价格必须大于 0
  priceCheck: check('products_price_check', sql`${table.price} > 0`),

  // 折扣价必须小于原价
  discountCheck: check(
    'products_discount_check',
    sql`${table.discountPrice} IS NULL OR ${table.discountPrice} < ${table.price}`
  ),

  // 评分范围 1-5
  ratingCheck: check(
    'products_rating_check',
    sql`${table.rating} >= 1 AND ${table.rating} <= 5`
  ),
}));
```

### DEFAULT 约束

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // 静态默认值
  status: varchar('status', { length: 20 }).default('draft'),
  viewCount: integer('view_count').default(0),
  isPublic: boolean('is_public').default(false),

  // 动态默认值
  createdAt: timestamp('created_at').defaultNow(),

  // 自动更新
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

---

## 时间戳字段

### 标准时间戳模式

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // ✅ 创建时间：自动设置，不可修改
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // ✅ 更新时间：自动设置，自动更新
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),

  // ✅ 软删除时间：可选
  deletedAt: timestamp('deleted_at'),
});
```

### 时区处理

```typescript
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),

  // 不带时区（存储服务器本地时间）
  localTime: timestamp('local_time').defaultNow(),

  // 带时区（推荐：存储 UTC 时间）
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
});

// 使用建议：
// - 用户行为追踪：使用 timestamp（不带时区）
// - 全球事件调度：使用 timestamp with timezone
// - 日期选择器：存储为 date 类型
```

---

## 软删除模式

### 基础软删除

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }),

  // 软删除标记
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  // 为软删除查询优化
  deletedAtIdx: index('posts_deleted_at_idx').on(table.deletedAt),
}));

// 查询未删除记录
const activePosts = await db
  .select()
  .from(posts)
  .where(isNull(posts.deletedAt));

// 软删除
await db
  .update(posts)
  .set({ deletedAt: new Date() })
  .where(eq(posts.id, postId));

// 恢复
await db
  .update(posts)
  .set({ deletedAt: null })
  .where(eq(posts.id, postId));

// 硬删除（物理删除）
await db
  .delete(posts)
  .where(eq(posts.id, postId));
```

### 扩展软删除模式

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }),

  // 软删除相关字段
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by').references(() => users.id),
  deleteReason: text('delete_reason'),
}, (table) => ({
  deletedAtIdx: index('users_deleted_at_idx').on(table.deletedAt),
}));
```

---

## 常见设计模式

### 审计日志模式

```typescript
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  // 操作信息
  action: varchar('action', { length: 50 }).notNull(), // create, update, delete
  entity: varchar('entity', { length: 50 }).notNull(), // users, posts, orders
  entityId: uuid('entity_id').notNull(),

  // 用户信息
  userId: uuid('user_id').references(() => users.id),
  userEmail: varchar('user_email', { length: 255 }),

  // 变更内容
  oldData: jsonb('old_data').$type<Record<string, any>>(),
  newData: jsonb('new_data').$type<Record<string, any>>(),

  // 元数据
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('audit_logs_entity_idx').on(table.entity, table.entityId),
  userIdx: index('audit_logs_user_idx').on(table.userId),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
}));
```

### 版本控制模式

```typescript
export const documentVersions = pgTable('document_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull(),

  // 版本信息
  version: integer('version').notNull(), // 1, 2, 3...
  title: varchar('title', { length: 255 }),
  content: text('content'),

  // 变更信息
  changeDescription: text('change_description'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  docVersionIdx: unique('doc_version_unq').on(table.documentId, table.version),
}));
```

### 标签系统模式

```typescript
// 标签表
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
  color: varchar('color', { length: 7 }), // #FF5733
});

// 文章标签关联
export const postTags = pgTable('post_tags', {
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.postId, table.tagId] }),
}));
```

### 层级数据模式

```typescript
// 方案1：邻接列表（Adjacency List）
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  parentId: uuid('parent_id').references((): any => categories.id),
});

// 方案2：路径枚举（Path Enumeration）
export const categories2 = pgTable('categories2', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  path: varchar('path', { length: 500 }), // "/1/3/5"
});

// 方案3：嵌套集合（Nested Set）
export const categories3 = pgTable('categories3', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  lft: integer('lft').notNull(),
  rgt: integer('rgt').notNull(),
});
```

### 状态机模式

```typescript
// 订单状态流转
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),

  // 状态字段
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  // pending -> paid -> processing -> shipped -> delivered
  // pending -> cancelled

  // 状态时间戳
  paidAt: timestamp('paid_at'),
  processingAt: timestamp('processing_at'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  cancelledAt: timestamp('cancelled_at'),
});

// 订单状态历史
export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),

  fromStatus: varchar('from_status', { length: 20 }),
  toStatus: varchar('to_status', { length: 20 }).notNull(),
  note: text('note'),

  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 最佳实践总结

### ✅ 推荐做法

1. **使用 UUID 作为主键**（分布式友好）
2. **snake_case 数据库命名，camelCase TypeScript 命名**
3. **为外键、常用查询字段添加索引**
4. **使用软删除替代硬删除**（可恢复）
5. **添加 createdAt/updatedAt 时间戳**
6. **使用 Zod schema 验证输入数据**
7. **为关系定义 onDelete 策略**
8. **使用 jsonb 存储灵活数据**

### ❌ 避免做法

1. **不要使用数据库关键字作为列名**
2. **不要在小表上创建过多索引**
3. **不要在大文本字段上创建索引**
4. **不要使用 SELECT * 查询**
5. **不要在应用层做 JOIN（使用 ORM relations）**
6. **不要忽略数据库约束（依赖应用层验证）**
7. **不要使用魔法数字**（用枚举或常量）

---

## 相关资源

- [query-patterns.md](./query-patterns.md) - 查询模式大全
- [migration-guide.md](./migration-guide.md) - 迁移最佳实践
- [performance.md](./performance.md) - 性能优化指南
- [testing.md](./testing.md) - 数据库测试策略
