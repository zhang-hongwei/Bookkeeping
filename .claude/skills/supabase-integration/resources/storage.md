# Supabase Storage Best Practices

Complete guide for file storage management with Supabase.

## Storage Setup

### Create Bucket

```sql
-- Create a public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create a private bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);
```

### Storage Policies

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Users can only access their own files
CREATE POLICY "Users can access own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can only update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can only delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## File Upload

### Basic Upload

```typescript
// Upload from file input
const file = event.target.files[0];
const fileExt = file.name.split('.').pop();
const fileName = `${Math.random()}.${fileExt}`;
const filePath = `${userId}/${fileName}`;

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
```

### Upload with Progress

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    onUploadProgress: (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      console.log(`Upload progress: ${percent}%`);
    },
  });
```

### Upload Component

```typescript
// components/FileUpload.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export function FileUpload({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const supabase = createClient();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          setProgress(percent);
        },
      });

    setUploading(false);

    if (error) {
      alert(error.message);
    } else {
      alert('Upload successful!');
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading: {progress.toFixed(0)}%</p>}
    </div>
  );
}
```

## File Download

### Download File

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .download('user-id/document.pdf');

if (data) {
  // Create download link
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
```

### Get Public URL

```typescript
// For public buckets
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-id/avatar.png');

console.log(data.publicUrl);
// https://project.supabase.co/storage/v1/object/public/avatars/user-id/avatar.png
```

### Create Signed URL

```typescript
// For private buckets (expires after specified time)
const { data, error } = await supabase.storage
  .from('documents')
  .createSignedUrl('user-id/document.pdf', 60); // Expires in 60 seconds

console.log(data.signedUrl);
```

## File Management

### List Files

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .list('user-id', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });

console.log(data);
// [
//   { name: 'document1.pdf', id: '...', size: 1024 },
//   { name: 'document2.pdf', id: '...', size: 2048 },
// ]
```

### Delete Files

```typescript
// Delete single file
const { error } = await supabase.storage
  .from('documents')
  .remove(['user-id/document.pdf']);

// Delete multiple files
const { error } = await supabase.storage
  .from('documents')
  .remove([
    'user-id/document1.pdf',
    'user-id/document2.pdf',
  ]);
```

### Move/Rename Files

```typescript
const { error } = await supabase.storage
  .from('documents')
  .move('user-id/old-name.pdf', 'user-id/new-name.pdf');
```

### Copy Files

```typescript
const { error } = await supabase.storage
  .from('documents')
  .copy('user-id/source.pdf', 'user-id/copy.pdf');
```

## Image Transformation

```typescript
// Resize image
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-id/avatar.png', {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover',
    },
  });

// Multiple transformations
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-id/avatar.png', {
    transform: {
      width: 400,
      height: 400,
      resize: 'contain',
      quality: 80,
      format: 'webp',
    },
  });
```

## File Validation

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB.');
  }

  return true;
}

// Use in upload
const file = event.target.files?.[0];
if (file) {
  try {
    validateFile(file);
    // Proceed with upload
  } catch (error) {
    alert(error.message);
  }
}
```

## File Metadata

```typescript
// Upload with metadata
const { data, error } = await supabase.storage
  .from('documents')
  .upload(filePath, file, {
    cacheControl: '3600',
    contentType: 'application/pdf',
    upsert: false,
    metadata: {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      category: 'invoice',
    },
  });

// Get file metadata
const { data, error } = await supabase.storage
  .from('documents')
  .list('user-id');

console.log(data[0].metadata);
```

## Best Practices

### 1. File Organization

```typescript
// ✅ Good: Organize by user/date/type
const filePath = `${userId}/${year}/${month}/${fileType}/${fileName}`;

// ❌ Bad: Flat structure
const filePath = fileName;
```

### 2. File Naming

```typescript
// ✅ Good: Use UUID or timestamp
const fileName = `${crypto.randomUUID()}.${fileExt}`;
const fileName = `${Date.now()}-${file.name}`;

// ❌ Bad: Use original filename directly (can have conflicts)
const fileName = file.name;
```

### 3. Error Handling

```typescript
const { error } = await supabase.storage
  .from('documents')
  .upload(filePath, file);

if (error) {
  if (error.message.includes('duplicate')) {
    console.error('File already exists');
  } else if (error.message.includes('policy')) {
    console.error('Permission denied');
  } else {
    console.error('Upload failed:', error.message);
  }
}
```

### 4. Cleanup

```typescript
// Delete old files when user updates profile picture
async function updateAvatar(userId: string, newFile: File) {
  const supabase = createClient();

  // List existing files
  const { data: files } = await supabase.storage
    .from('avatars')
    .list(userId);

  // Upload new file
  const newPath = `${userId}/${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(newPath, newFile);

  if (!uploadError && files && files.length > 0) {
    // Delete old files
    const filesToDelete = files.map(f => `${userId}/${f.name}`);
    await supabase.storage
      .from('avatars')
      .remove(filesToDelete);
  }
}
```
