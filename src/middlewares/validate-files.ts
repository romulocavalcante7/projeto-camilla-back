import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

export class FileValidatorMiddleware {
  public validateFile(req: Request, res: Response, next: NextFunction) {
    const file = req.file as Express.Multer.File;

    if (!file) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: "No file provided" });
    }

    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "video/mp4",
      "video/webm",
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: "File type not allowed" });
    }

    next();
  }

  public validateFiles(req: Request, res: Response, next: NextFunction) {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: "No files provided" });
    }

    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "video/mp4",
      "video/webm",
    ];

    for (const file of files) {
      if (!allowedMimes.includes(file.mimetype)) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: `File type not allowed: ${file.originalname}` });
      }
    }

    next();
  }
}

export const fileValidatorMiddleware = new FileValidatorMiddleware();
