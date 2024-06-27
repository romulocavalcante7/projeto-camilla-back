import Joi from "joi";

const addFavoriteSticker = {
  body: Joi.object().keys({
    stickerId: Joi.string().uuid().required(),
  }),
};

const removeFavoriteSticker = {
  params: Joi.object().keys({
    stickerId: Joi.string().uuid().required(),
  }),
};

const getAllFavoriteStickers = {
  // No additional validation needed for fetching all favorites
};

export default {
  addFavoriteSticker,
  removeFavoriteSticker,
  getAllFavoriteStickers,
};
