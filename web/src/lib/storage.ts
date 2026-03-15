import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minio_user',
  secretKey: process.env.MINIO_SECRET_KEY || 'minio_password',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'moodflow-audio';

export async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket "${BUCKET_NAME}" created successfully.`);
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

export async function uploadAudio(fileName: string, buffer: Buffer, contentType: string = 'audio/wav') {
  await ensureBucketExists();
  try {
    await minioClient.putObject(BUCKET_NAME, fileName, buffer, buffer.length, {
      'Content-Type': contentType,
    });
    
    // Return the URL or path to the file
    // For local MinIO, we can return the internal path or a presigned URL
    // In production, this would be a public URL or a path used by the backend
    return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${fileName}`;
  } catch (error) {
    console.error('Error uploading audio to MinIO:', error);
    throw error;
  }
}

export async function getPresignedUrl(fileName: string) {
  try {
    return await minioClient.presignedGetObject(BUCKET_NAME, fileName, 24 * 60 * 60);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

export default minioClient;
