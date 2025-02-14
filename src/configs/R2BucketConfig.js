import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { ApiConstant } from "constants/ApiConstant";
import { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } from "../configs/AppConfig";

const s3Client = new S3Client({
  region: "auto",
  endpoint: ApiConstant.BUCKET_URL,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export const uploadToR2 = async (key, data) => {
  try {
    const params = {
      Bucket: ApiConstant.BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    };

    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);

    console.log("File uploaded successfully:", response);
    return response;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

export const getFromR2 = async (key) => {
  try {
    const params = {
      Bucket: ApiConstant.BUCKET_NAME,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const data = await response.Body.transformToString();
    const parsedData = JSON.parse(data);

    console.log("File fetched successfully:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error fetching file:", error);
    throw error;
  }
};
