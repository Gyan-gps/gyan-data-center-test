import { z } from "zod";

// ✅ Zod schema — treat all env vars as strings; transform numbers if needed
const envSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:8080"),
  VITE_APP_NAME: z.string().default("Data Center Intelligence"),

  // VITE_VWO_ACCOUNT_ID: z.string().transform((v) => {
  //   const num = Number(v);
  //   if (Number.isNaN(num)) {
  //     throw new Error("VITE_VWO_ACCOUNT_ID must be a number");
  //   }
  //   return num;
  // }),

  // VITE_FIREBASE_API_KEY: z.string(),
  // VITE_FIREBASE_AUTH_DOMAIN: z.string(),
  // VITE_FIREBASE_PROJECT_ID: z.string(),
  // VITE_FIREBASE_STORAGE_BUCKET: z.string(),
  // VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  // VITE_FIREBASE_APP_ID: z.string(),
});

// ✅ Parse & validate at build time
export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  // VITE_VWO_ACCOUNT_ID: import.meta.env.VITE_VWO_ACCOUNT_ID,
  // VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  // VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env
  //   .VITE_FIREBASE_MESSAGING_SENDER_ID,
  // VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
});
