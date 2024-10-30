import express from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import webhookRoute from "./webhook.route";
import uploadRoutes from "./upload.route";
import categoryRoutes from "./category.route";
import subnichesRoutes from "./subniche.route";
import stickerRoutes from "./sticker.route";
import userStickerRoutes from "./userSticker.route";
import fontRoutes from "./font.route";
import iconRoutes from "./icon.route";
import favoriteStickerRoutes from "./favoriteSticker.route";
import paymentRoutes from "./payment.route";
import searchRoutes from "./search.route";
import tutorialRoutes from "./tutorial.route";
import docsRoute from "./docs.route";
import config from "../../config/config";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/webhook",
    route: webhookRoute,
  },
  {
    path: "/files",
    route: uploadRoutes,
  },
  {
    path: "/fonts",
    route: fontRoutes,
  },
  {
    path: "/icons",
    route: iconRoutes,
  },
  {
    path: "/categories",
    route: categoryRoutes,
  },
  {
    path: "/subniches",
    route: subnichesRoutes,
  },
  {
    path: "/stickers",
    route: stickerRoutes,
  },
  {
    path: "/userStickers",
    route: userStickerRoutes,
  },
  {
    path: "/favoriteSticker",
    route: favoriteStickerRoutes,
  },
  {
    path: "/payment",
    route: paymentRoutes,
  },
  {
    path: "/search",
    route: searchRoutes,
  },
  {
    path: "/tutorials",
    route: tutorialRoutes,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
