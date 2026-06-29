---
name: refactoring
version: 1.0.0
description: 代码重构最佳实践和模式
priority: medium
dependencies: [frontend-dev, backend-dev]
triggers:
  keywords: [refactor, optimize, improve, clean, restructure, 重构, 优化, 改进, 整理]
  files: ["**/*.ts", "**/*.tsx"]
  intents: ["refactor code", "improve structure", "optimize performance"]
---

# Refactoring Skill

> 代码重构策略、设计模式和最佳实践

> ⚠️ **重要提示**：本规范为项目重构标准。如需要通用最佳实践，可参考 `.claude/rules/best-practices.md`。

## 🎯 重构原则

### 何时重构

1. **Rule of Three**：相同代码出现3次时
2. **添加功能时**：使添加更容易
3. **修复Bug时**：改善代码理解
4. **代码审查时**：发现改进机会

### 重构前准备

```typescript
// 1. 确保有测试覆盖
pnpm test --coverage

// 2. 创建基准分支
git checkout -b refactor/feature-name

// 3. 小步提交
git add -p
git commit -m "refactor: extract method"
```

## 🔄 常见重构模式

### 1. 提取函数（Extract Function）

```typescript
// ❌ Before: 长函数
function processOrder(order: Order) {
  // 验证订单
  if (!order.items || order.items.length === 0) {
    throw new Error('订单不能为空');
  }
  if (order.total < 0) {
    throw new Error('订单金额无效');
  }

  // 计算折扣
  let discount = 0;
  if (order.customer.isVIP) {
    discount = order.total * 0.2;
  } else if (order.total > 100) {
    discount = order.total * 0.1;
  }

  // 应用折扣
  const finalAmount = order.total - discount;

  // 更多逻辑...
}

// ✅ After: 提取函数
function processOrder(order: Order) {
  validateOrder(order);
  const discount = calculateDiscount(order);
  const finalAmount = applyDiscount(order.total, discount);
  // ...
}

function validateOrder(order: Order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('订单不能为空');
  }
  if (order.total < 0) {
    throw new Error('订单金额无效');
  }
}

function calculateDiscount(order: Order): number {
  if (order.customer.isVIP) {
    return order.total * 0.2;
  }
  if (order.total > 100) {
    return order.total * 0.1;
  }
  return 0;
}

function applyDiscount(total: number, discount: number): number {
  return total - discount;
}
```

### 2. 提取组件（Extract Component）

```tsx
// ❌ Before: 大组件
function UserProfile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {/* 用户信息部分 */}
      <div className="user-info">
        <img src={user?.avatar} />
        <h1>{user?.name}</h1>
        <p>{user?.bio}</p>
        <button onClick={() => setIsEditing(true)}>编辑</button>
      </div>

      {/* 编辑表单 */}
      {isEditing && (
        <form>
          <input name="name" defaultValue={user?.name} />
          <textarea name="bio" defaultValue={user?.bio} />
          <button type="submit">保存</button>
        </form>
      )}

      {/* 用户文章列表 */}
      <div className="posts">
        {posts.map(post => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ✅ After: 提取组件
function UserProfile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <UserInfo user={user} onEdit={() => setIsEditing(true)} />
      {isEditing && (
        <UserEditForm user={user} onSave={handleSave} />
      )}
      <UserPostList posts={posts} />
    </div>
  );
}

function UserInfo({ user, onEdit }: UserInfoProps) {
  return (
    <div className="user-info">
      <Avatar src={user?.avatar} alt={user?.name} />
      <h1>{user?.name}</h1>
      <p>{user?.bio}</p>
      <Button onClick={onEdit}>编辑</Button>
    </div>
  );
}

function UserEditForm({ user, onSave }: UserEditFormProps) {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <TextField {...register('name')} defaultValue={user?.name} />
      <TextField {...register('bio')} multiline defaultValue={user?.bio} />
      <Button type="submit">保存</Button>
    </form>
  );
}

function UserPostList({ posts }: { posts: Post[] }) {
  return (
    <div className="posts">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 3. 替换条件表达式（Replace Conditionals）

```typescript
// ❌ Before: 复杂条件
function getShippingCost(order: Order): number {
  if (order.customer.type === 'premium') {
    return 0;
  } else if (order.customer.type === 'standard') {
    if (order.total > 100) {
      return 0;
    } else {
      return 10;
    }
  } else if (order.customer.type === 'guest') {
    if (order.total > 200) {
      return 5;
    } else {
      return 15;
    }
  }
  return 20;
}

// ✅ After: 策略模式
interface ShippingStrategy {
  calculate(order: Order): number;
}

const shippingStrategies: Record<string, ShippingStrategy> = {
  premium: {
    calculate: () => 0,
  },
  standard: {
    calculate: (order) => order.total > 100 ? 0 : 10,
  },
  guest: {
    calculate: (order) => order.total > 200 ? 5 : 15,
  },
  default: {
    calculate: () => 20,
  },
};

function getShippingCost(order: Order): number {
  const strategy = shippingStrategies[order.customer.type] || shippingStrategies.default;
  return strategy.calculate(order);
}
```

### 4. 合并重复代码（Consolidate Duplicate）

```typescript
// ❌ Before: 重复代码
async function createUser(data: UserData) {
  try {
    const user = await db.insert(users).values(data).returning();
    await logger.log('User created', user.id);
    await sendEmail(user.email, 'Welcome');
    return { success: true, data: user };
  } catch (error) {
    await logger.error('Failed to create user', error);
    return { success: false, error: error.message };
  }
}

async function updateUser(id: string, data: UserData) {
  try {
    const user = await db.update(users).set(data).where(eq(users.id, id)).returning();
    await logger.log('User updated', user.id);
    await sendEmail(user.email, 'Profile updated');
    return { success: true, data: user };
  } catch (error) {
    await logger.error('Failed to update user', error);
    return { success: false, error: error.message };
  }
}

// ✅ After: 提取通用逻辑
async function executeUserOperation<T>(
  operation: () => Promise<T>,
  logMessage: string,
  emailTemplate?: string
): Promise<Result<T>> {
  try {
    const result = await operation();
    await logger.log(logMessage, result.id);

    if (emailTemplate && result.email) {
      await sendEmail(result.email, emailTemplate);
    }

    return { success: true, data: result };
  } catch (error) {
    await logger.error(`Failed: ${logMessage}`, error);
    return { success: false, error: error.message };
  }
}

async function createUser(data: UserData) {
  return executeUserOperation(
    () => db.insert(users).values(data).returning(),
    'User created',
    'Welcome'
  );
}

async function updateUser(id: string, data: UserData) {
  return executeUserOperation(
    () => db.update(users).set(data).where(eq(users.id, id)).returning(),
    'User updated',
    'Profile updated'
  );
}
```

## 🏗️ 架构重构

### 分层架构重构

```typescript
// ❌ Before: 混合关注点
// pages/api/products.ts
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 直接在 API 中写 SQL
    const products = await db.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.active = true
    `);

    // 直接在 API 中处理业务逻辑
    const processedProducts = products.map(p => ({
      ...p,
      discountPrice: p.price * (1 - p.discount),
      inStock: p.quantity > 0,
    }));

    res.json(processedProducts);
  }
}

// ✅ After: 清晰分层
// app/api/products/route.ts
export async function GET() {
  const products = await productService.getActiveProducts();
  return NextResponse.json(products);
}

// services/product.service.ts
class ProductService {
  async getActiveProducts() {
    const products = await productRepository.findActiveWithCategory();
    return products.map(this.enrichProduct);
  }

  private enrichProduct(product: Product) {
    return {
      ...product,
      discountPrice: this.calculateDiscountPrice(product),
      inStock: this.checkStock(product),
    };
  }
}

// repositories/product.repository.ts
class ProductRepository {
  async findActiveWithCategory() {
    return await db
      .select({
        ...products,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.active, true));
  }
}
```

### 状态管理重构

```typescript
// ❌ Before: 分散的状态
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [filters, sortBy]);

  // 组件逻辑...
}

// ✅ After: 集中状态管理
// store/products.store.ts
interface ProductState {
  products: Product[];
  loading: boolean;
  error: Error | null;
  filters: ProductFilters;
  sortBy: SortOption;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  filters: {},
  sortBy: 'name',

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const params = buildQueryParams(get().filters, get().sortBy);
      const products = await api.getProducts(params);
      set({ products, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchProducts();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().fetchProducts();
  },
}));

// components/ProductList.tsx
function ProductList() {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  // 简化的组件逻辑...
}
```

## ⚡ 性能重构

### 1. 组件优化

```tsx
// ❌ Before: 未优化
function ExpensiveList({ items, filter }) {
  // 每次渲染都重新计算
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  // 每次渲染都创建新函数
  const handleClick = (id) => {
    console.log('Clicked:', id);
  };

  return (
    <div>
      {filteredItems.map(item => (
        <div key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}

// ✅ After: 优化后
const ExpensiveList = memo(({ items, filter }) => {
  // 记忆化计算结果
  const filteredItems = useMemo(
    () => items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    ),
    [items, filter]
  );

  // 记忆化回调
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  return (
    <div>
      {filteredItems.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onClick={handleClick}
        />
      ))}
    </div>
  );
});

const ListItem = memo(({ item, onClick }) => (
  <div onClick={() => onClick(item.id)}>
    {item.name}
  </div>
));
```

### 2. 查询优化

```typescript
// ❌ Before: N+1 查询
async function getUsersWithPosts() {
  const users = await db.select().from(users);

  for (const user of users) {
    user.posts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, user.id));
  }

  return users;
}

// ✅ After: 单次查询
async function getUsersWithPosts() {
  return await db.query.users.findMany({
    with: {
      posts: true,
    },
  });
}
```

## 📋 重构检查清单

### 代码级别
- [ ] 函数是否过长？（> 20行）
- [ ] 是否有重复代码？
- [ ] 变量命名是否清晰？
- [ ] 是否有魔术数字？
- [ ] 条件嵌套是否过深？

### 组件级别
- [ ] 组件是否过大？（> 200行）
- [ ] 是否职责单一？
- [ ] props 是否过多？（> 5个）
- [ ] 是否可复用？

### 架构级别
- [ ] 是否遵循分层架构？
- [ ] 依赖方向是否正确？
- [ ] 是否有循环依赖？
- [ ] 模块边界是否清晰？

## 📚 更多资源

详细指南请查看 `resources/` 目录：
- `refactoring-catalog.md` - 重构目录大全
- `design-patterns.md` - 设计模式应用
- `code-smells.md` - 代码坏味道识别
- `performance-refactoring.md` - 性能重构
- `legacy-code.md` - 遗留代码处理