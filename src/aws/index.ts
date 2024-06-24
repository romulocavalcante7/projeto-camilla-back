import { S3Client } from "@aws-sdk/client-s3";
import config from "../config/config";

export const s3 = new S3Client({
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretKey,
  },
  endpoint: config.aws.endpoint,
  region: config.aws.region,
  apiVersion: "latest",
  forcePathStyle: true,
});
