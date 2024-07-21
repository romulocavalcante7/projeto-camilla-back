import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import uploadService from "../services/upload.service";
import prisma from "../client";

const addFile = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  if (!file) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "No file provided" });
  }
  const { filename, filesize, filetype, url } = await uploadService.uploadFile(file);
  const savedAttachment = await prisma.attachment.create({
    data: {
      filename,
      filetype,
      filesize,
      url,
    },
  });
  res.status(httpStatus.CREATED).json(savedAttachment);
});

const addMultiplesFiles = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const { userId } = req.body || {};
  if (!files || files.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "No files sent",
    });
  }
  const uploadedFiles = await uploadService.uploadFiles(files); // Chama o serviço de upload e captura as informações

  const savedFiles = await Promise.all(
    uploadedFiles.map(async (fileInfo) => {
      const savedFile = await prisma.attachment.create({
        data: {
          filename: fileInfo.filename,
          filetype: fileInfo.filetype,
          filesize: fileInfo.filesize,
          url: fileInfo.url,
          userId: userId ? userId : null,
        },
      });
      return savedFile;
    })
  );

  res
    .status(httpStatus.CREATED)
    .json({ message: "Files uploaded successfully", files: savedFiles });
});

const deleteFile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params || {};
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "No file ID provided" });
  }
  await uploadService.deleteFile(id);
  res.status(httpStatus.OK).json({ message: "File deleted successfully" });
});

const listAllFiles = catchAsync(async (_req: Request, res: Response) => {
  const files = await uploadService.listFiles();
  res.status(httpStatus.OK).json({
    files: files,
  });
});

const listFileById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params || {};
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "No file ID provided" });
  }
  const fileDetails = await uploadService.getFileById(id);
  res.status(httpStatus.OK).json({
    file: fileDetails,
  });
});

export default {
  addFile,
  addMultiplesFiles,
  deleteFile,
  listAllFiles,
  listFileById,
};
