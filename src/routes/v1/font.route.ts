import express from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import fontController from "../../controllers/font.controller";
import fontValidation from "../../validations/font.validation";

const router = express.Router();

router.route("/all").get(auth(), validate(fontValidation), fontController.getAllFonts);

router.route("/total").get(auth(), fontController.getTotalFonts);
router.route("/important").get(auth(), fontController.getImportantFonts);
router.route("/markImportant").post(auth(), fontController.markFontAsImportant);
router.route("/removeImportant").post(auth(), fontController.removeFontImportant);
router.route("/setOrder").post(auth(), fontController.setFontDisplayOrder);

router
  .route("/create")
  .post(auth("admin"), validate(fontValidation.createFont), fontController.createFont);

router
  .route("/:fontId")
  .get(auth(), validate(fontValidation.getFontById), fontController.getFontById)
  .patch(auth("admin"), validate(fontValidation.updateFont), fontController.updateFont)
  .delete(auth("admin"), validate(fontValidation.deleteFont), fontController.deleteFont);

export default router;
