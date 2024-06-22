import express from "express";
// import auth from "../../middlewares/auth";
// import validate from "../../middlewares/validate";
// import { userValidation } from "../../validations";
import { userController } from "../../controllers";

const router = express.Router();

router.route("/").post(userController.handleOrderApproved);

export default router;
