const required = [
  "DATABASE_URL",
  "MOODFLOW_AUTH_SECRET",
  "AI_SERVICE_BASE_URL",
  "MINIO_ENDPOINT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Missing environment variable: ${key}`);
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  authSecret: process.env.MOODFLOW_AUTH_SECRET ?? "development-secret",
  aiServiceBaseUrl: process.env.AI_SERVICE_BASE_URL ?? "http://localhost:8000",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  minio: {
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: Number(process.env.MINIO_PORT ?? "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY ?? "",
    secretKey: process.env.MINIO_SECRET_KEY ?? "",
    bucket: process.env.MINIO_BUCKET ?? "moodflow-audio",
  },
  maxAudioFileSizeBytes: Number(process.env.MAX_AUDIO_FILE_SIZE_MB ?? "50") * 1024 * 1024,
};
