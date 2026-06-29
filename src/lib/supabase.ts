import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseKey);

// 创建具有管理员权限的客户端（用于服务端存储操作）
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

// 图片上传工具函数
export interface UploadImageOptions {
  file: File;
  bucket: string;
  path?: string;
}

export interface UploadImageResult {
  url: string;
  path: string;
}

export const uploadImage = async ({
  file,
  bucket,
  path
}: UploadImageOptions): Promise<UploadImageResult> => {
  // 生成唯一的文件路径
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2);
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${timestamp}_${randomString}.${fileExtension}`;
  const filePath = path ? `${path}/${fileName}` : fileName;

  // 上传文件
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`上传失败: ${error.message}`);
  }

  // 获取公共URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path
  };
};

// 删除图片工具函数
export const deleteImage = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`删除失败: ${error.message}`);
  }
};

// 创建缩略图工具函数
export const createThumbnail = (file: File, maxWidth = 300, maxHeight = 300, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制缩略图
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], `thumb_${file.name}`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(thumbnailFile);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};