import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import env from "../env";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

/**
 * Upload a JSON object to S3
 */
// biome-ignore lint/suspicious/noExplicitAny: allows uploading any JSON data
export async function uploadJson(key: string, data: any) {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: JSON.stringify(data, null, 2),
  });
  await s3.send(command);
}
