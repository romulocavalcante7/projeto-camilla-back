import express from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import tutorialValidation from "../../validations/tutorial.validation";
import tutorialController from "../../controllers/tutorial.controller";

const router = express.Router();

router
  .route("/all")
  .get(auth(), validate(tutorialValidation.getAllTutorials), tutorialController.getAllTutorials);

router.route("/total").get(auth("admin"), tutorialController.getTotalTutorials);
router.route("/important").get(auth(), tutorialController.getImportantTutorials);
router.route("/markImportant").post(auth("admin"), tutorialController.markTutorialAsImportant);
router.route("/removeImportant").post(auth("admin"), tutorialController.removeTutorialImportant);
router.route("/setOrder").post(auth("admin"), tutorialController.setTutorialDisplayOrder);

router
  .route("/create")
  .post(
    auth("admin"),
    validate(tutorialValidation.createTutorial),
    tutorialController.createTutorial
  );

router
  .route("/:tutorialId")
  .get(auth(), validate(tutorialValidation.getTutorialById), tutorialController.getTutorialById)
  .patch(
    auth("admin"),
    validate(tutorialValidation.updateTutorial),
    tutorialController.updateTutorial
  )
  .delete(
    auth("admin"),
    validate(tutorialValidation.deleteTutorial),
    tutorialController.deleteTutorial
  );

export default router;
