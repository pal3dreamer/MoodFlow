import { Client } from "minio";
import { env } from "@/lib/env";

const minio = new Client({
  endPoint: env.minio.endPoint,
  port: env.minio.port,
  useSSL: env.minio.useSSL,
  accessKey: env.minio.accessKey,
  secretKey: env.minio.secretKey,
});

export async function ensureBucket() {
  const exists = await minio.bucketExists(env.minio.bucket);
  if (!exists) {
    await minio.makeBucket(env.minio.bucket);
  }
}

export async function uploadAudioObject(input: {
  objectKey: string;
  data: Buffer;
  contentType: string;
}) {
  await ensureBucket();
  const result = await minio.putObject(env.minio.bucket, input.objectKey, input.data, input.data.length, {
    "Content-Type": input.contentType,
  });
  return {
    bucket: env.minio.bucket,
    etag: typeof result === "string" ? result : result.etag ?? null,
  };
}

export async function downloadAudioObject(objectKey: string) {
  const stream = await minio.getObject(env.minio.bucket, objectKey);
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve());
    stream.on("error", reject);
  });

  return Buffer.concat(chunks);
}

export async function deleteAudioObject(objectKey: string) {
  try {
    await minio.removeObject(env.minio.bucket, objectKey);
  } catch (error) {
    console.error("Failed to delete object from MinIO", error);
  }
}
