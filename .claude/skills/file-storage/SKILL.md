---
name: file-storage
version: 1.0.0
description: File storage abstraction layer supporting local, S3, and Supabase storage
priority: high
dependencies: []
triggers:
  keywords: [file upload, storage, S3, upload file, download file, file management]
  files: ["**/storage/**/*.ts", "**/lib/storage/**"]
  intents: ["upload file", "store file", "file storage", "s3 integration"]
---

# File Storage Skill

> 文件存储抽象层：支持本地、S3、Supabase 存储

## 🎯 Storage Abstraction

### Interface

```typescript
// lib/storage/types.ts
export interface StorageAdapter {
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<Blob>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}
```

## 📦 Implementations

### Local Storage

```typescript
// lib/storage/local.ts
import fs from 'fs/promises';
import path from 'path';

export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string;

  constructor(uploadDir: string = './uploads') {
    this.uploadDir = uploadDir;
  }

  async upload(file: File, filePath: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    return filePath;
  }

  async download(filePath: string): Promise<Blob> {
    const fullPath = path.join(this.uploadDir, filePath);
    const buffer = await fs.readFile(fullPath);
    return new Blob([buffer]);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);
    await fs.unlink(fullPath);
  }

  getUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }
}
```

### S3 Storage

```typescript
// lib/storage/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class S3StorageAdapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
    this.client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async upload(file: File, path: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: buffer,
        ContentType: file.type,
      })
    );

    return path;
  }

  async download(path: string): Promise<Blob> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      })
    );

    const buffer = await response.Body!.transformToByteArray();
    return new Blob([buffer]);
  }

  async delete(path: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      })
    );
  }

  getUrl(path: string): string {
    return `https://${this.bucket}.s3.amazonaws.com/${path}`;
  }
}
```

### Supabase Storage

```typescript
// lib/storage/supabase.ts
import { createClient } from '@/lib/supabase/server';

export class SupabaseStorageAdapter implements StorageAdapter {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  async upload(file: File, path: string): Promise<string> {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    return path;
  }

  async download(path: string): Promise<Blob> {
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .download(path);

    if (error) throw error;

    return data;
  }

  async delete(path: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) throw error;
  }

  getUrl(path: string): string {
    const supabase = createClient();
    const { data } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
```

## 🔧 Factory Pattern

```typescript
// lib/storage/factory.ts
export function createStorage(): StorageAdapter {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 's3':
      return new S3StorageAdapter(process.env.S3_BUCKET!);
    case 'supabase':
      return new SupabaseStorageAdapter(process.env.SUPABASE_BUCKET!);
    default:
      return new LocalStorageAdapter();
  }
}
```

## 📚 Usage Example

```typescript
// app/api/upload/route.ts
import { createStorage } from '@/lib/storage/factory';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  const storage = createStorage();
  const path = await storage.upload(file, `uploads/${file.name}`);
  const url = storage.getUrl(path);

  return NextResponse.json({ url });
}
```
