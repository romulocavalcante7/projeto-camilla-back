import express from "express";
import auth from "../../middlewares/auth";
import searchController from "../../controllers/searchController";

const router = express.Router();

router.route("/").get(auth(), searchController.searchCategoriesAndSubniches);

export default router;
