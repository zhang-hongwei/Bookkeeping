# Service Patterns - Business Logic Layer

Next.js 16 Service layer business logic development patterns and best practices.

## Table of Contents

- [Service Layer Responsibilities](#service-layer-responsibilities)
- [Service Class Structure](#service-class-structure)
- [Singleton Pattern](#singleton-pattern)
- [Dependency Injection](#dependency-injection)
- [Transaction Handling](#transaction-handling)
- [Caching Strategies](#caching-strategies)
- [Business Validation](#business-validation)
- [Async Operations](#async-operations)

---

## Service Layer Responsibilities

### What Services Should Do

**Core Responsibilities:**
- ✅ Business logic processing
- ✅ Data validation and transformation
- ✅ Transaction management
- ✅ Call Repository/Database
- ✅ Third-party service integration
- ✅ Business rule execution

**What Services Should NOT Do:**
- ❌ HTTP request/response handling (this is API Route's responsibility)
- ❌ Direct database operations (should use Repository or Database layer)
- ❌ UI-related logic
- ❌ Route-related logic

### Data Flow

```
API Route → Service → Repository/Database → PostgreSQL
    ↓
Request Validation
    ↓
Business Logic (Service)
    ↓
Data Access (Repository/DB)
    ↓
Response Formatting
```

---

## Service Class Structure

### Basic Service Template

```typescript
// services/user.service.ts
import { db } from '@/database/clients/db';
import { users, type InsertUser } from '@/database/schema';
import { UserRepository } from '@/repositories/user.repository';
import { eq, and } from 'drizzle-orm';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  /**
   * Get all users
   * Simple query: directly use database layer
   */
  async getAll() {
    return await db.select().from(users);
  }

  /**
   * Get user by ID
   */
  async getById(id: string) {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Get user with statistics
   * Complex query: use Repository
   */
  async getUserWithStats(userId: string) {
    return await this.repository.getUserWithStats(userId);
  }

  /**
   * Create user
   * Business logic + data validation
   */
  async create(data: InsertUser) {
    // 1. Business validation
    await this.validateEmail(data.email);

    // 2. Data transformation
    const userData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 3. Create user
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();

    // 4. Follow-up operations (async)
    this.sendWelcomeEmail(user.email).catch(console.error);

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<InsertUser>) {
    // 1. Validate user exists
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('User not found');
    }

    // 2. Update
    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete user (use Repository for cascading)
   */
  async delete(id: string) {
    return await this.repository.deleteWithRelations(id);
  }

  /**
   * Private method: email validation
   */
  private async validateEmail(email: string) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Email already registered');
    }
  }

  /**
   * Private method: send welcome email
   */
  private async sendWelcomeEmail(email: string) {
    // Email sending logic
    console.log(`Sending welcome email to ${email}`);
  }
}

// Export singleton
export const userService = new UserService();
```

---

## Singleton Pattern

### Why Use Singletons?

**Advantages:**
- ✅ Shared state (like caching)
- ✅ Reduce instantiation overhead
- ✅ Simplify dependency management
- ✅ Easy to mock during testing

### Singleton Implementation

```typescript
// services/auth.service.ts
class AuthService {
  private static instance: AuthService;
  private cache: Map<string, any> = new Map();

  // Private constructor
  private constructor() {}

  // Get singleton
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async validateToken(token: string) {
    // Check cache
    if (this.cache.has(token)) {
      return this.cache.get(token);
    }

    // Validation logic
    const result = await this.verifyToken(token);

    // Cache result
    this.cache.set(token, result);

    return result;
  }

  private async verifyToken(token: string) {
    // Token validation logic
    return { valid: true, userId: '123' };
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
```

### Simplified Singleton (Recommended)

```typescript
// services/product.service.ts
export class ProductService {
  private cache = new Map();

  async getProducts() {
    // Implementation logic
  }

  clearCache() {
    this.cache.clear();
  }
}

// Directly export instance
export const productService = new ProductService();
```

---

## Dependency Injection

### Constructor Injection

```typescript
// services/order.service.ts
import { db } from '@/database/clients/db';
import { OrderRepository } from '@/repositories/order.repository';
import { ProductService } from './product.service';
import { EmailService } from './email.service';

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private productService: ProductService,
    private emailService: EmailService
  ) {}

  async createOrder(userId: string, items: OrderItem[]) {
    // 1. Validate product inventory
    for (const item of items) {
      const product = await this.productService.getById(item.productId);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock: ${product.name}`);
      }
    }

    // 2. Create order (through Repository)
    const order = await this.orderRepository.createWithItems({
      userId,
      items,
      total: this.calculateTotal(items),
    });

    // 3. Send confirmation email
    await this.emailService.sendOrderConfirmation(userId, order.id);

    return order;
  }

  private calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}

// Create instance with injected dependencies
export const orderService = new OrderService(
  new OrderRepository(),
  productService,  // Imported singleton from other file
  emailService
);
```

---

## Transaction Handling

### Basic Transactions

```typescript
// services/transfer.service.ts
import { db } from '@/database/clients/db';
import { accounts } from '@/database/schema';
import { eq, sql } from 'drizzle-orm';

export class TransferService {
  /**
   * Transfer money (requires transaction for atomicity)
   */
  async transfer(fromId: string, toId: string, amount: number) {
    return await db.transaction(async (tx) => {
      // 1. Deduct amount
      const [fromAccount] = await tx
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} - ${amount}`
        })
        .where(eq(accounts.id, fromId))
        .returning();

      // 2. Check balance
      if (fromAccount.balance < 0) {
        throw new Error('Insufficient balance');
      }

      // 3. Add amount
      const [toAccount] = await tx
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${amount}`
        })
        .where(eq(accounts.id, toId))
        .returning();

      return { from: fromAccount, to: toAccount };
    });
  }
}

export const transferService = new TransferService();
```

### Complex Transactions

```typescript
// services/enrollment.service.ts
export class EnrollmentService {
  /**
   * Student course enrollment (multi-step transaction)
   */
  async enrollStudent(studentId: string, courseId: string) {
    return await db.transaction(async (tx) => {
      // 1. Check course capacity
      const [course] = await tx
        .select()
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);

      if (!course) {
        throw new Error('Course not found');
      }

      const enrolledCount = await tx
        .select({ count: sql<number>`count(*)` })
        .from(enrollments)
        .where(eq(enrollments.courseId, courseId));

      if (enrolledCount[0].count >= course.capacity) {
        throw new Error('Course is full');
      }

      // 2. Check if student already enrolled
      const existing = await tx
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, studentId),
            eq(enrollments.courseId, courseId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error('Already enrolled in this course');
      }

      // 3. Create enrollment record
      const [enrollment] = await tx
        .insert(enrollments)
        .values({
          studentId,
          courseId,
          enrolledAt: new Date(),
        })
        .returning();

      // 4. Update course statistics
      await tx
        .update(courses)
        .set({
          currentEnrollment: sql`${courses.currentEnrollment} + 1`,
        })
        .where(eq(courses.id, courseId));

      return enrollment;
    });
  }
}
```

---

## Caching Strategies

### In-Memory Caching

```typescript
// services/config.service.ts
export class ConfigService {
  private cache = new Map<string, { value: any; expiry: number }>();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getConfig(key: string) {
    // 1. Check cache
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    // 2. Get from database
    const config = await db
      .select()
      .from(configs)
      .where(eq(configs.key, key))
      .limit(1);

    const value = config[0]?.value;

    // 3. Write to cache
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.CACHE_TTL,
    });

    return value;
  }

  /**
   * Clear cache
   */
  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const configService = new ConfigService();
```

### LRU Cache

```typescript
// services/user-profile.service.ts
import { LRUCache } from 'lru-cache';

export class UserProfileService {
  private cache = new LRUCache<string, UserProfile>({
    max: 500,  // Cache at most 500 items
    ttl: 1000 * 60 * 5,  // 5 minutes expiration
  });

  async getProfile(userId: string): Promise<UserProfile> {
    // Check cache
    const cached = this.cache.get(userId);
    if (cached) return cached;

    // Get from database
    const profile = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        posts: true,
        comments: true,
      },
    });

    if (profile) {
      this.cache.set(userId, profile);
    }

    return profile;
  }

  invalidateCache(userId: string) {
    this.cache.delete(userId);
  }
}

export const userProfileService = new UserProfileService();
```

---

## Business Validation

### Data Validation

```typescript
// services/post.service.ts
export class PostService {
  /**
   * Create post (with business validation)
   */
  async create(userId: string, data: InsertPost) {
    // 1. Validate user permissions
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error('User not found');
    }

    if (user[0].role !== 'admin' && user[0].role !== 'editor') {
      throw new Error('No permission to publish posts');
    }

    // 2. Validate title uniqueness
    const existingSlug = await this.generateUniqueSlug(data.title);

    // 3. Content validation
    if (data.content.length < 100) {
      throw new Error('Post content too short, at least 100 characters required');
    }

    // 4. Create post
    const [post] = await db
      .insert(posts)
      .values({
        ...data,
        userId,
        slug: existingSlug,
        status: 'draft',
        createdAt: new Date(),
      })
      .returning();

    return post;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = title.toLowerCase().replace(/\s+/g, '-');
    let counter = 1;

    while (true) {
      const existing = await db
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      if (existing.length === 0) break;

      slug = `${title}-${counter}`.toLowerCase().replace(/\s+/g, '-');
      counter++;
    }

    return slug;
  }
}

export const postService = new PostService();
```

---

## Async Operations

### Background Tasks

```typescript
// services/notification.service.ts
export class NotificationService {
  /**
   * Send notification (don't block main flow)
   */
  async notifyUser(userId: string, message: string) {
    // Send asynchronously, don't wait for completion
    this.sendEmailNotification(userId, message).catch((error) => {
      console.error('Email sending failed:', error);
    });

    // Immediately create notification record
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        message,
        createdAt: new Date(),
      })
      .returning();

    return notification;
  }

  private async sendEmailNotification(userId: string, message: string) {
    // Email sending logic (might be slow)
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Email sent to user ${userId}`);
  }
}

export const notificationService = new NotificationService();
```

### Parallel Operations

```typescript
// services/dashboard.service.ts
export class DashboardService {
  /**
   * Get dashboard data (parallel queries)
   */
  async getDashboardData(userId: string) {
    const [userStats, posts, notifications, activities] = await Promise.all([
      this.getUserStats(userId),
      this.getRecentPosts(userId),
      this.getNotifications(userId),
      this.getRecentActivities(userId),
    ]);

    return {
      stats: userStats,
      posts,
      notifications,
      activities,
    };
  }

  private async getUserStats(userId: string) {
    // Statistics query
  }

  private async getRecentPosts(userId: string) {
    // Posts query
  }

  private async getNotifications(userId: string) {
    // Notifications query
  }

  private async getRecentActivities(userId: string) {
    // Activities query
  }
}

export const dashboardService = new DashboardService();
```

---

## Best Practices Summary

### ✅ Recommended Practices

1. **Single Responsibility**: Each Service handles one business domain
2. **Use Singletons**: Export Service instances rather than classes
3. **Business Validation**: Execute all business rules in Service layer
4. **Transaction Handling**: Use Drizzle transactions to ensure data consistency
5. **Caching Strategies**: Use memory caching appropriately to improve performance
6. **Error Handling**: Throw clear business exceptions
7. **Async Operations**: Execute non-blocking operations asynchronously

### ❌ Avoid These Practices

1. **Mixed Responsibilities**: Services should not handle HTTP-related logic
2. **Direct Database Access**: Complex queries should use Repository
3. **Missing Validation**: All input data should be validated
4. **Ignoring Transactions**: Multi-step operations must use transactions
5. **Over-Caching**: Don't cache frequently changing data
6. **Synchronous Waiting**: Avoid blocking external calls

---

## Related Resources

- [Architecture Overview](./architecture-overview.md) - Architecture Overview
- [Repository Patterns](./repository-patterns.md) - Repository Patterns
- [Error Handling](./error-handling.md) - Error Handling
- [Testing](./testing.md) - Testing Strategies