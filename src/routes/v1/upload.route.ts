import { Router } from "express";
import multer from "multer";
// import { storage } from "../../utils/multer";
const uploadMulter = multer();
import { uploadController } from "../../controllers";
import { fileValidatorMiddleware } from "../../middlewares/validate-files";

const upload = Router();

upload.post(
  "/upload",
  uploadMulter.single("file"),
  fileValidatorMiddleware.validateFile.bind(fileValidatorMiddleware),
  uploadController.addFile
);

upload.post(
  "/multi-upload",
  uploadMulter.array("files", 40),
  fileValidatorMiddleware.validateFiles.bind(fileValidatorMiddleware),
  uploadController.addMultiplesFiles
);

upload.delete("/:id", uploadController.deleteFile);

upload.get("/", uploadController.listAllFiles);

upload.get("/:id", uploadController.listFileById);

export default upload;
