import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import { s3 } from "../aws";
import config from "../config/config";

interface UploadResult {
  url: string;
  filename: string;
  filetype: string;
  filesize: number;
}

/**
 * Faz o upload de um arquivo para o S3
 * @param {Express.Multer.File} file - O arquivo a ser carregado
 * @returns {Promise<UploadResult>}
 */
const uploadFile = async (file: Express.Multer.File): Promise<UploadResult> => {
  const fileName: string = file.originalname;

  const uploadCommand = new PutObjectCommand({
    Bucket: config.aws.bucketName,
    Key: fileName,
    Body: file.buffer,
    ACL: "public-read",
  });
  await s3.send(uploadCommand);

  const publicUrl = `${config.aws.endpoint}/${config.aws.bucketName}/${fileName}`;
  const filesize = file.size;
  const filetype = file.mimetype;

  return { url: publicUrl, filename: fileName, filetype, filesize };
};

/**
 * Faz o upload de múltiplos arquivos para o S3
 * @param {Express.Multer.File[]} files - Os arquivos a serem carregados
 * @returns {Promise<UploadResult[]>}
 */
const uploadFiles = async (files: Express.Multer.File[]): Promise<UploadResult[]> => {
  const uploadPromises = files.map(async (file) => {
    const fileName: string = file.originalname;

    const uploadCommand = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read",
    });
    await s3.send(uploadCommand);

    const publicUrl = `${config.aws.endpoint}/${config.aws.bucketName}/${fileName}`;
    const filesize = file.size;
    const filetype = file.mimetype;

    return { filename: fileName, filetype, filesize, url: publicUrl };
  });

  return Promise.all(uploadPromises);
};

/**
 * Exclui um arquivo do S3
 * @param {string} id - O ID do arquivo a ser excluído
 * @returns {Promise<DeleteObjectCommandOutput>}
 */
const deleteFile = async (url: string): Promise<any> => {
  const key = url.split("/").pop();
  if (!key) {
    throw new Error("Invalid URL format");
  }

  const params = {
    Bucket: config.aws.bucketName,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  return await s3.send(command);
};

/**
 * Obtém informações de um arquivo por ID no S3
 * @param {string} key - A chave (nome) do arquivo no S3
 * @returns {Promise<any>}
 */
const getFileById = async (
  key: string
): Promise<{ key: string; size: number; lastModified: Date; contentType: string }> => {
  const params = {
    Bucket: config.aws.bucketName,
    Key: key,
  };

  const data = await s3.send(new HeadObjectCommand(params));

  return {
    key: key,
    size: data.ContentLength ?? 0,
    lastModified: data.LastModified ?? new Date(),
    contentType: data.ContentType ?? "",
  };
};

/**
 * Lista todos os arquivos no S3
 * @returns {Promise<any>}
 */
const listFiles = async (): Promise<any[]> => {
  const params = {
    Bucket: config.aws.bucketName,
  };

  const data = await s3.send(new ListObjectsV2Command(params));
  return data.Contents ?? [];
};

export default {
  uploadFile,
  uploadFiles,
  deleteFile,
  getFileById,
  listFiles,
};
