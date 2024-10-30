import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import path from "path";

export class FileValidatorMiddleware {
  public validateFile(req: Request, res: Response, next: NextFunction) {
    const file = req.file as Express.Multer.File;

    if (!file) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: "No file provided" });
    }

    // Tipos MIME permitidos
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "video/mp4",
      "video/webm",
      "font/ttf",
      "font/otf",
      "font/woff",
      "font/woff2",
      "application/x-font-ttf",
      "application/x-font-opentype",
      "application/x-font-woff",
      "application/font-woff2",
    ];

    // Extensões de arquivos permitidas
    const allowedExtensions = [".ttf", ".otf", ".woff", ".woff2"];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Valida se o tipo MIME ou a extensão é permitido
    if (!allowedMimes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: "File type not allowed" });
    }

    next();
  }

  public validateFiles(req: Request, res: Response, next: NextFunction) {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: "No files provided" });
    }

    // Tipos MIME permitidos
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "video/mp4",
      "video/webm",
      "font/ttf",
      "font/otf",
      "font/woff",
      "font/woff2",
      "application/x-font-ttf",
      "application/x-font-opentype",
      "application/x-font-woff",
      "application/font-woff2",
    ];

    // Extensões de arquivos permitidas
    const allowedExtensions = [".ttf", ".otf", ".woff", ".woff2"];

    for (const file of files) {
      const fileExtension = path.extname(file.originalname).toLowerCase();

      // Valida se o tipo MIME ou a extensão é permitido
      if (!allowedMimes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: `File type not allowed: ${file.originalname}` });
      }
    }

    next();
  }
}

export const fileValidatorMiddleware = new FileValidatorMiddleware();
