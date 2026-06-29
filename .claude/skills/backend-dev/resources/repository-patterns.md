# Repository Patterns - Data Access Layer

Next.js 16 Data access layer best practices with Drizzle ORM and PostgreSQL.

## Table of Contents

- [Repository Pattern Overview](#repository-pattern-overview)
- [Repository Design Principles](#repository-design-principles)
- [Basic Repository Implementation](#basic-repository-implementation)
- [Complex Query Repository](#complex-query-repository)
- [Database Access Guidelines](#database-access-guidelines)
- [Query Optimization](#query-optimization)
- [Connection Management](#connection-management)

---

## Repository Pattern Overview

### Why Use Repository Pattern?

**Key Benefits:**
- ✅ **Single Responsibility**: Isolate data access logic
- ✅ **Testability**: Easy to mock in tests
- ✅ **Maintainability**: Centralize query logic
- ✅ **Reusability**: Share queries across services
- ✅ **Consistency**: Standardized CRUD operations
- ✅ **Security**: Centralized input validation

### Repository vs Service

**Repository (Data Access):**
- Direct Drizzle operations
- Query building and optimization
- Database-specific logic
- Caching at data level
- No business rules

**Service (Business Logic):**
- Orchestrates multiple repositories
- Business rule validation
- Transaction management
- External service calls
- Complex workflows

### Repository Layer Architecture

```
Service Layer
    ↓
Repository Layer
    ↓
Database Layer (Drizzle)
    ↓
PostgreSQL
```

---

## Repository Design Principles

### Core Principles

1. **Single Table Focus**: Each repository handles one table/entity
2. **CRUD Operations**: Standard Create, Read, Update, Delete
3. **Type Safety**: Leverage TypeScript inference
4. **Error Handling**: Convert database errors to domain errors
5. **Query Optimization**: Use efficient Drizzle patterns

### Repository Interface

```typescript
// base.repository.ts
export interface IBaseRepository<T> {
  // Basic CRUD
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;

  // Advanced queries
  findMany(options: FindManyOptions<T>): Promise<T[]>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  count(options?: CountOptions): Promise<number>;
}
```

---

## Basic Repository Implementation

### User Repository

```typescript
// repositories/user.repository.ts
import { db } from '@/database/clients/db';
import { users, type InsertUser, type User } from '@/database/schema';
import { eq, and, like, or, sql } from 'drizzle-orm';

export class UserRepository {
  /**
   * Create user
   */
  async create(data: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return user || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user || null;
  }

  /**
   * Find multiple users
   */
  async findAll(): Promise<User[]> {
    return await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, id));
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return !!user;
  }

  /**
   * Find users with pagination
   */
  async findManyWithPagination(options: {
    offset: number;
    limit: number;
    search?: string;
  }): Promise<User[]> {
    let query = db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
      limit: options.limit,
      offset: options.offset,
    });

    // Add search filter
    if (options.search) {
      query = db.query.users.findMany({
        where: or(
          like(users.name, `%${options.search}%`),
          like(users.email, `%${options.search}%`)
        ),
        orderBy: (users, { desc }) => [desc(users.createdAt)],
        limit: options.limit,
        offset: options.offset,
      });
    }

    return await query;
  }

  /**
   * Count users
   */
  async count(search?: string): Promise<number> {
    if (search) {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(
          or(
            like(users.name, `%${search}%`),
            like(users.email, `%${search}%`)
          )
        );

      return result.count;
    }

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    return result.count;
  }
}

// Export singleton
export const userRepository = new UserRepository();
```

### Post Repository

```typescript
// repositories/post.repository.ts
import { db } from '@/database/clients/db';
import { posts, type InsertPost, type Post } from '@/database/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';

export class PostRepository {
  /**
   * Create post
   */
  async create(data: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return post;
  }

  /**
   * Find post by ID
   */
  async findById(id: string): Promise<Post | null> {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    return post || null;
  }

  /**
   * Find posts by author
   */
  async findByAuthor(authorId: string): Promise<Post[]> {
    return await db.query.posts.findMany({
      where: eq(posts.authorId, authorId),
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
  }

  /**
   * Find published posts
   */
  async findPublished(options?: {
    offset?: number;
    limit?: number;
    search?: string;
  }): Promise<Post[]> {
    const { offset = 0, limit = 10, search } = options || {};

    let whereConditions = eq(posts.status, 'published');

    if (search) {
      whereConditions = and(
        eq(posts.status, 'published'),
        or(
          like(posts.title, `%${search}%`),
          like(posts.content, `%${search}%`)
        )
      );
    }

    return await db.query.posts.findMany({
      where: whereConditions,
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit,
      offset,
    });
  }

  /**
   * Update post
   */
  async update(id: string, data: Partial<InsertPost>): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    return post;
  }

  /**
   * Delete post
   */
  async delete(id: string): Promise<void> {
    await db
      .delete(posts)
      .where(eq(posts.id, id));
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await db
      .update(posts)
      .set({
        viewCount: sql`${posts.viewCount} + 1`,
      })
      .where(eq(posts.id, id));
  }

  /**
   * Search posts by title
   */
  async searchByTitle(title: string): Promise<Post[]> {
    return await db.query.posts.findMany({
      where: and(
        eq(posts.status, 'published'),
        like(posts.title, `%${title}%`)
      ),
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
  }

  /**
   * Get popular posts
   */
  async getPopularPosts(limit: number = 5): Promise<Post[]> {
    return await db.query.posts.findMany({
      where: eq(posts.status, 'published'),
      orderBy: (posts, { desc }) => [desc(posts.viewCount)],
      limit,
    });
  }
}

export const postRepository = new PostRepository();
```

---

## Complex Query Repository

### Analytics Repository

```typescript
// repositories/analytics.repository.ts
import { db } from '@/database/clients/db';
import { posts, users, comments, likes } from '@/database/schema';
import { eq, sql, gte, lte, and } from 'drizzle-orm';

export class AnalyticsRepository {
  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [stats] = await db
      .select({
        postsCount: sql<number>`count(distinct ${posts.id})`,
        commentsCount: sql<number>`count(distinct ${comments.id})`,
        likesReceived: sql<number>`count(distinct ${likes.id})`,
        totalViews: sql<number>`sum(${posts.viewCount})`,
      })
      .from(users)
      .leftJoin(posts, eq(posts.authorId, users.id))
      .leftJoin(comments, eq(comments.authorId, users.id))
      .leftJoin(likes, eq(likes.authorId, users.id))
      .where(eq(users.id, userId))
      .groupBy(users.id);

    return {
      postsCount: stats.postsCount || 0,
      commentsCount: stats.commentsCount || 0,
      likesReceived: stats.likesReceived || 0,
      totalViews: stats.totalViews || 0,
    };
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    const [userStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [postStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.status, 'published'));

    const [commentStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments);

    const [likeStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(likes);

    return {
      totalUsers: userStats.count,
      totalPosts: postStats.count,
      totalComments: commentStats.count,
      totalLikes: likeStats.count,
    };
  }

  /**
   * Get posts statistics by date range
   */
  async getPostsStatsByDateRange(startDate: Date, endDate: Date) {
    return await db
      .select({
        date: sql<string>`DATE(${posts.createdAt})`,
        postsCount: sql<number>`count(*)`,
        totalViews: sql<number>`sum(${posts.viewCount})`,
        averageViews: sql<number>`avg(${posts.viewCount})`,
      })
      .from(posts)
      .where(
        and(
          gte(posts.createdAt, startDate),
          lte(posts.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(${posts.createdAt})`)
      .orderBy(sql`DATE(${posts.createdAt})`);
  }

  /**
   * Get top authors by posts
   */
  async getTopAuthors(limit: number = 10) {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        postsCount: sql<number>`count(${posts.id})`,
        totalViews: sql<number>`sum(${posts.viewCount})`,
        averageViews: sql<number>`avg(${posts.viewCount})`,
      })
      .from(users)
      .leftJoin(posts, eq(posts.authorId, users.id))
      .where(eq(posts.status, 'published'))
      .groupBy(users.id, users.name, users.email)
      .orderBy(sql`count(${posts.id}) desc`)
      .limit(limit);
  }

  /**
   * Get posts by category stats
   */
  async getPostsByCategoryStats() {
    return await db
      .select({
        category: posts.category,
        postsCount: sql<number>`count(*)`,
        totalViews: sql<number>`sum(${posts.viewCount})`,
        averageViews: sql<number>`avg(${posts.viewCount})`,
      })
      .from(posts)
      .where(eq(posts.status, 'published'))
      .groupBy(posts.category)
      .orderBy(sql`count(*) desc`);
  }
}

export const analyticsRepository = new AnalyticsRepository();
```

### Search Repository

```typescript
// repositories/search.repository.ts
import { db } from '@/database/clients/db';
import { posts, users, comments } from '@/database/schema';
import { eq, or, and, like, sql } from 'drizzle-orm';

export class SearchRepository {
  /**
   * Global search
   */
  async search(query: string, options: {
    type?: 'posts' | 'users' | 'all';
    limit?: number;
    offset?: number;
  }) {
    const { type = 'all', limit = 10, offset = 0 } = options;
    const searchTerm = `%${query}%`;

    const results: {
      posts: any[];
      users: any[];
    } = {
      posts: [],
      users: [],
    };

    // Search posts
    if (type === 'posts' || type === 'all') {
      results.posts = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: sql<string>`LEFT(${posts.content}, 200)`,
          author: users.name,
          authorId: posts.authorId,
          createdAt: posts.createdAt,
          viewCount: posts.viewCount,
          type: sql<string>`'post'`,
        })
        .from(posts)
        .leftJoin(users, eq(users.id, posts.authorId))
        .where(
          and(
            eq(posts.status, 'published'),
            or(
              like(posts.title, searchTerm),
              like(posts.content, searchTerm)
            )
          )
        )
        .orderBy(sql`
          CASE
            WHEN ${posts.title} LIKE ${`%${query}%`} THEN 1
            ELSE 2
          END,
          ${posts.createdAt} DESC
        `)
        .limit(limit)
        .offset(offset);
    }

    // Search users
    if (type === 'users' || type === 'all') {
      results.users = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          bio: sql<string>`LEFT(${users.bio}, 100)`,
          createdAt: users.createdAt,
          type: sql<string>`'user'`,
        })
        .from(users)
        .where(
          or(
            like(users.name, searchTerm),
            like(users.email, searchTerm),
            like(users.bio, searchTerm)
          )
        )
        .orderBy(sql`
          CASE
            WHEN ${users.name} LIKE ${`%${query}%`} THEN 1
            ELSE 2
          END,
          ${users.createdAt} DESC
        `)
        .limit(limit)
        .offset(offset);
    }

    return results;
  }

  /**
   * Search suggestions
   */
  async getSearchSuggestions(query: string, limit: number = 5) {
    const searchTerm = `${query}%`;

    const [postSuggestions, userSuggestions] = await Promise.all([
      db
        .select({
          title: posts.title,
          type: sql<string>`'post'`,
        })
        .from(posts)
        .where(
          and(
            eq(posts.status, 'published'),
            like(posts.title, searchTerm)
          )
        )
        .orderBy(sql`${posts.viewCount} DESC`)
        .limit(limit),

      db
        .select({
          name: users.name,
          type: sql<string>`'user'`,
        })
        .from(users)
        .where(like(users.name, searchTerm))
        .orderBy(sql`LENGTH(${users.name}) ASC`)
        .limit(limit),
    ]);

    return {
      posts: postSuggestions.map(p => p.title),
      users: userSuggestions.map(u => u.name),
    };
  }
}

export const searchRepository = new SearchRepository();
```

---

## Database Access Guidelines

### Use Repository Layer

**✅ Recommended: Repository Pattern**
```typescript
// Service layer
async createUser(data: CreateUserInput) {
  // Business validation
  if (await userRepository.emailExists(data.email)) {
    throw new Error('Email already exists');
  }

  // Use repository
  return await userRepository.create(data);
}
```

**❌ Avoid: Direct Database Access in Service**
```typescript
// Service layer (bad practice)
async createUser(data: CreateUserInput) {
  // Direct database access
  const [user] = await db.insert(users).values(data).returning();
  return user;
}
```

### Use Repository Layer

**✅ Recommended: Use Repository Layer**
```typescript
// app/api/users/route.ts
import { userRepository } from '@/repositories/user.repository';

export async function POST(request: NextRequest) {
  const data = await request.json();

  // Use repository
  const user = await userRepository.create(data);

  return NextResponse.json(user);
}
```

**❌ Avoid: Direct Database Access in Routes**
```typescript
// app/api/users/route.ts (bad practice)
import { db } from '@/database/clients/db';
import { users } from '@/database/schema';

export async function POST(request: NextRequest) {
  const data = await request.json();

  // Direct database access
  const [user] = await db.insert(users).values(data).returning();

  return NextResponse.json(user);
}
```

---

## Query Optimization

### Efficient Queries

```typescript
// repositories/user.repository.ts
export class UserRepository {
  /**
   * Efficient user lookup with minimal fields
   */
  async findMinimalUser(id: string) {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then(rows => rows[0] || null);
  }

  /**
   * Batch user lookup
   */
  async findManyByIds(ids: string[]) {
    return await db
      .select()
      .from(users)
      .where(sql`${users.id} = ANY(${ids})`);
  }

  /**
   * Optimized search with indexes
   */
  async searchUsers(query: string) {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
      })
      .from(users)
      .where(
        or(
          // Assuming name and email have indexes
          like(users.name, `%${query}%`),
          like(users.email, `%${query}%`)
        )
      )
      .limit(20);
  }
}
```

### Join Optimization

```typescript
// repositories/post.repository.ts
export class PostRepository {
  /**
   * Optimized post list with author info
   */
  async findPostsWithAuthors(limit: number, offset: number) {
    return await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorName: users.name,
        authorEmail: users.email,
      })
      .from(posts)
      .leftJoin(users, eq(users.id, posts.authorId))
      .where(eq(posts.status, 'published'))
      .orderBy(posts.createdAt)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Post with related data
   */
  async findPostWithRelations(id: string) {
    return await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: {
          columns: { id: true, name: true, email: true },
        },
        comments: {
          with: {
            author: {
              columns: { id: true, name: true },
            },
          },
          orderBy: (comments, { asc }) => [asc(comments.createdAt)],
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }
}
```

---

## Connection Management

### Use the Shared Database Instance

```typescript
// database/clients/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';

// Create connection pool
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create database instance
export const db = drizzle(client, { schema });
```

### Transaction Patterns

```typescript
// repositories/transaction.repository.ts
export class TransactionRepository {
  /**
   * Complex transaction with multiple operations
   */
  async createPostWithComments(data: {
    postData: InsertPost;
    comments: InsertComment[];
  }) {
    return await db.transaction(async (tx) => {
      // Create post
      const [post] = await tx
        .insert(posts)
        .values(data.postData)
        .returning();

      // Create comments
      if (data.comments.length > 0) {
        await tx
          .insert(comments)
          .values(
            data.comments.map(comment => ({
              ...comment,
              postId: post.id,
            }))
          );
      }

      // Update user stats
      await tx
        .update(users)
        .set({
          postsCount: sql`${users.postsCount} + 1`,
        })
        .where(eq(users.id, data.postData.authorId));

      return post;
    });
  }

  /**
   * Batch operations
   */
  async batchCreateUsers(usersData: InsertUser[]) {
    return await db.transaction(async (tx) => {
      // Batch insert
      const createdUsers = await tx
        .insert(users)
        .values(usersData)
        .returning();

      // Create user profiles
      const profiles = createdUsers.map(user => ({
        userId: user.id,
        bio: '',
      }));

      await tx
        .insert(userProfiles)
        .values(profiles);

      return createdUsers;
    });
  }
}

export const transactionRepository = new TransactionRepository();
```

---

## Best Practices Summary

### ✅ Recommended Practices

1. **Repository Pattern**: Isolate data access logic
2. **Single Responsibility**: One repository per entity
3. **Type Safety**: Use Drizzle's type inference
4. **Query Optimization**: Use efficient queries and indexes
5. **Transaction Management**: Use transactions for multi-step operations
6. **Error Handling**: Convert database errors appropriately
7. **Consistency**: Standardize CRUD operations

### ❌ Avoid These Practices

1. **Direct Database Access**: Access database directly in services/routes
2. **N+1 Queries**: Use proper joins and eager loading
3. **Missing Indexes**: Optimize slow queries
4. **Large Result Sets**: Use pagination and limit results
5. **Unclosed Connections**: Let Drizzle manage connections
6. **Raw SQL When Possible**: Prefer Drizzle's query builder

---

## Related Resources

- [Architecture Overview](./architecture-overview.md) - Architecture Overview
- [Service Patterns](./service-patterns.md) - Service Layer Patterns
- [Error Handling](./error-handling.md) - Error Handling
- [Testing](./testing.md) - Testing Strategies