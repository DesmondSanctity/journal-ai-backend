export interface Env {
 ENVIRONMENT: string;
 JWT_SECRET: string;
 R2_BUCKET_URL: string;
 JOURNAL_KV: KVNamespace;
 JOURNAL_AUDIO: R2Bucket;
 ASSEMBLY_AI_KEY: string;
 TRANSCRIPTION_SOCKET: DurableObjectNamespace;
}

export const getEnvVar = (env: Env, key: keyof Env): string => {
 const value = env[key];
 if (!value) {
  throw new Error(`Missing environment variable: ${key}`);
 }
 return value.toString();
};
