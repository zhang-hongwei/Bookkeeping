# Supabase Database Best Practices

Advanced patterns for working with Supabase PostgreSQL database.

## Query Patterns

### Basic CRUD

```typescript
// Create
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'My Post',
    content: 'Post content',
    author_id: user.id,
  })
  .select()
  .single();

// Read
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('id', postId)
  .single();

// Update
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

### Advanced Queries

```typescript
// Multiple conditions
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .gte('created_at', '2024-01-01')
  .order('created_at', { ascending: false });

// Text search
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .textSearch('title', 'supabase', {
    config: 'english',
  });

// Full-text search with multiple columns
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .or('title.ilike.%supabase%,content.ilike.%supabase%');

// Range queries
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .gte('views', 100)
  .lte('views', 1000);
```

### Joins and Relations

```typescript
// One-to-many
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    author:users!author_id(
      id,
      name,
      avatar
    )
  `);

// Many-to-many
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    tags:post_tags(
      tag:tags(
        id,
        name
      )
    )
  `);

// Nested relations
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    author:users!author_id(
      id,
      name,
      posts:posts!author_id(count)
    ),
    comments:comments(
      id,
      content,
      user:users(name, avatar)
    )
  `);
```

### Aggregations

```typescript
// Count
const { count, error } = await supabase
  .from('posts')
  .select('*', { count: 'exact', head: true });

// With filters
const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .eq('status', 'published');
```

### Pagination

```typescript
const PAGE_SIZE = 10;
const page = 1;

const { data, error, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
```

## Row Level Security (RLS)

### Basic Policies

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Posts are viewable by everyone"
ON posts FOR SELECT
USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert posts"
ON posts FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can only update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = author_id);

-- Users can only delete their own posts
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = author_id);
```

### Advanced Policies

```sql
-- Role-based access
CREATE POLICY "Admins can view all posts"
ON posts FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR
  status = 'published'
);

-- Time-based access
CREATE POLICY "Posts are visible after publish date"
ON posts FOR SELECT
USING (
  published_at IS NULL
  OR published_at <= NOW()
);

-- Organization-based access
CREATE POLICY "Users can only see posts in their org"
ON posts FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

## Database Functions

### PostgreSQL Functions

```sql
-- Create a function
CREATE OR REPLACE FUNCTION get_user_posts(user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.created_at
  FROM posts p
  WHERE p.author_id = user_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Call from TypeScript
const { data, error } = await supabase
  .rpc('get_user_posts', { user_id: userId });
```

### Trigger Functions

```sql
-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Type Safety

```typescript
// Define your database schema types
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Use with Supabase client
const supabase = createClient<Database>();

// Now TypeScript knows the shape of your data
const { data } = await supabase
  .from('posts')
  .select('*');
// data is typed as Database['public']['Tables']['posts']['Row'][]
```

## Performance Optimization

### Indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Composite index
CREATE INDEX idx_posts_author_status ON posts(author_id, status);

-- Partial index
CREATE INDEX idx_posts_published ON posts(published_at)
WHERE status = 'published';
```

### Query Optimization

```typescript
// ❌ Don't fetch unnecessary data
const { data } = await supabase
  .from('posts')
  .select('*');

// ✅ Select only needed columns
const { data } = await supabase
  .from('posts')
  .select('id, title, created_at');

// ❌ Don't use multiple queries
const { data: posts } = await supabase.from('posts').select('*');
const authors = await Promise.all(
  posts.map(post =>
    supabase.from('users').select('*').eq('id', post.author_id).single()
  )
);

// ✅ Use joins
const { data } = await supabase
  .from('posts')
  .select('*, author:users(*)');
```

## Error Handling

```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'My Post' })
  .select()
  .single();

if (error) {
  // Handle specific error codes
  if (error.code === '23505') {
    console.error('Duplicate key violation');
  } else if (error.code === '23503') {
    console.error('Foreign key violation');
  } else {
    console.error('Database error:', error.message);
  }
  return;
}

console.log('Created post:', data);
```
