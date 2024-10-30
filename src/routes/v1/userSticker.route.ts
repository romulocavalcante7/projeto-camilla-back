import express from "express";
import { userStickerController } from "../../controllers";
import auth from "../../middlewares/auth";

const router = express.Router();

router.route("/").post(auth(), userStickerController.createSticker);

router.route("/user").get(auth(), userStickerController.getUserStickers);

router
  .route("/:stickerId")
  .get(auth(), userStickerController.getStickerById)
  .patch(auth(), userStickerController.updateSticker)
  .delete(auth(), userStickerController.deleteSticker);

export default router;
