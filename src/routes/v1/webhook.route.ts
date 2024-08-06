/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import express from "express";
import { userController } from "../../controllers";

const router = express.Router();

const setToken = (tokenType) => (req, res, next) => {
  req.tokenType = tokenType;
  next();
};

router.route("/single").post(setToken("singleToken"), userController.handleOrderApproved);
router
  .route("/subscription")
  .post(setToken("subscriptionToken"), userController.handleOrderApproved);

export default router;
