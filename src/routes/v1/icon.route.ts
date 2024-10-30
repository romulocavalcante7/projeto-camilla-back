import express from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import iconController from "../../controllers/icon.controller";
import iconValidation from "../../validations/icon.validation";

const router = express.Router();

router.route("/all").get(auth(), validate(iconValidation), iconController.getAllIcons);

router.route("/total").get(auth(), iconController.getTotalIcons);
router.route("/important").get(auth(), iconController.getImportantIcons);
router.route("/markImportant").post(auth(), iconController.markIconAsImportant);
router.route("/removeImportant").post(auth(), iconController.removeIconImportant);
router.route("/setOrder").post(auth(), iconController.setIconDisplayOrder);

router
  .route("/create")
  .post(auth("admin"), validate(iconValidation.createIcon), iconController.createIcon);

router
  .route("/:iconId")
  .get(auth(), validate(iconValidation.getIconById), iconController.getIconById)
  .patch(auth("admin"), validate(iconValidation.updateIcon), iconController.updateIcon)
  .delete(auth("admin"), validate(iconValidation.deleteIcon), iconController.deleteIcon);

export default router;
