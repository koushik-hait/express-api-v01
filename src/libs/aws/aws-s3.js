import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  S3RequestPresigner,
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

import { param } from "express-validator";
import fs from "fs";
import { readFile } from "fs/promises";
import logger from "../../logger/winston.logger.js";

// AWS S3 configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const rootS3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

export const getS3KeyFromUrl = (url) => {
  return url.replace(rootS3Url, "");
};

export async function deleteFromS3(s3Key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  };
  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    logger.info("Downloaded from S3:", response.Body);
    // console.log("Downloaded from S3:", response.Body);
    return response.Body;
  } catch (err) {
    console.error("Error downloading from S3:", err);
    throw err;
  }
}

/**
 * Generates a key for an AWS S3 object, with the following pattern:
 * ${username}/${year}/${month}/${day}/${fileName}
 * @param {string} username
 * @param {string} fileName
 * @returns {string}
 */
export function generateS3Key(email, fileName, uploadType) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const username = email.split("@")[0];

  return `${username}/${uploadType}/${year}/${month}/${day}/${fileName}`;
}

export async function uploadToS3(filepath, s3Key, fileFormat) {
  const params = {
    // ACL: "public-read",
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: await readFile(filepath),
    //ContentType: fileFormat, // Adjust based on the image format
  };

  console.log(params);

  try {
    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);
    // const presigner = new S3RequestPresigner(s3Client); // Optional: if you want to use presigned URLs
    // const url = await presigner.presign(command, { expiresIn: 3600 }); // Optional: if you want to use presigned URLs
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // only if you want to use presigned URLs at time of object creation
    logger.info("Uploaded to S3:", url);
    fs.unlinkSync(filepath);
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw err;
  }
}

export async function downloadFromS3(s3Key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  };
  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    logger.info("Downloaded from S3:", url);
    // console.log("Downloaded from S3:", url);
    return url;
  } catch (err) {
    // console.error("Error downloading from S3:", err);
    logger.error("Error downloading from S3:", err);
    throw err;
  }
}

export async function getS3ImageAsBase64(s3Key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    // Convert the stream to a buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Convert buffer to base64
    const base64Image = buffer.toString("base64");

    return base64Image;
  } catch (err) {
    console.error("Error getting image from S3:", err);
    throw err;
  }
}
