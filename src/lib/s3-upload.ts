// S3兼容的上传工具 (Supabase Storage)
import { nanoid } from 'nanoid';

interface S3UploadOptions {
  file: File;
  bucket?: string;
  path?: string;
}

interface S3UploadResult {
  url: string;
  path: string;
}

export const uploadToS3 = async ({
  file,
  bucket = 'meal-images',
  path = 'meals'
}: S3UploadOptions): Promise<S3UploadResult> => {
  
  // 生成唯一文件名
  const timestamp = new Date().getTime();
  const randomId = nanoid(10);
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${timestamp}_${randomId}.${fileExtension}`;
  const filePath = `${path}/${fileName}`;

  // 构建S3兼容的上传URL
  const baseUrl = 'https://rivyvovqbhziryyimfqk.storage.supabase.co';
  const uploadUrl = `${baseUrl}/storage/v1/s3/${bucket}/${filePath}`;

  // 准备上传
  const formData = new FormData();
  formData.append('file', file);

  // AWS S3风格的认证头
  const headers = {
    'Authorization': `AWS4-HMAC-SHA256 Credential=30194a3e1f807127298341611fceac98/${new Date().toISOString().split('T')[0]}/us-east-1/s3/aws4_request`,
    'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
  };

  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
        'x-amz-acl': 'public-read',
        ...headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('S3上传失败:', response.status, errorText);
      throw new Error(`上传失败: ${response.status} ${errorText}`);
    }

    // 构建公共URL
    const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${filePath}`;

    return {
      url: publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('上传错误:', error);
    throw error;
  }
};