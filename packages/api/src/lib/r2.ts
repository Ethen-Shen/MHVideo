import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'mhvideo';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export interface UploadResult {
  key: string;
  url: string;
}

// 上传文件到 R2
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
  };
}

// 生成预签名上传 URL
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

// 生成文件存储路径
export function getVideoKey(seriesId: string, episodeNumber: number, ext: string = 'mp4'): string {
  return `videos/${seriesId}/${episodeNumber}.${ext}`;
}

export function getCoverKey(seriesId: string, episodeNumber: number, ext: string = 'jpg'): string {
  return `covers/${seriesId}/${episodeNumber}.${ext}`;
}

export function getAvatarKey(userId: string, ext: string = 'jpg'): string {
  return `avatars/${userId}.${ext}`;
}

export { r2Client, BUCKET_NAME, PUBLIC_URL };
