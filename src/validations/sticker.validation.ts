import Joi from "joi";

const createSticker = {
  body: Joi.object().keys({
    name: Joi.string().empty(""),
    attachmentId: Joi.string().uuid().required(),
    categoryId: Joi.string().uuid().required(),
    subnicheId: Joi.string().uuid().allow(null).optional(),
    userId: Joi.string().uuid().allow(null).optional(),
    translations: Joi.array()
      .items(
        Joi.object().keys({
          language: Joi.string().required(),
          name: Joi.string().required(),
        })
      )
      .allow(null)
      .optional(),
  }),
};

const getAllStickers = {};

const getStickerById = {
  params: Joi.object().keys({
    stickerId: Joi.string().uuid().required(),
  }),
};

const getStickersBySubnicheId = {
  params: Joi.object().keys({
    subnicheId: Joi.string().uuid().required(),
  }),
};
const getStickersByCategoryId = {
  params: Joi.object().keys({
    categoryId: Joi.string().uuid().required(),
  }),
};

const updateSticker = {
  params: Joi.object().keys({
    stickerId: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().empty(""),
      attachmentId: Joi.string().uuid().optional(),
      categoryId: Joi.string().uuid().optional(),
      subnicheId: Joi.string().uuid().optional(),
      userId: Joi.string().uuid().optional(),
      translations: Joi.array()
        .items(
          Joi.object().keys({
            language: Joi.string().required(),
            name: Joi.string().required(),
          })
        )
        .optional(),
    })
    .min(1),
};

const deleteSticker = {
  params: Joi.object().keys({
    stickerId: Joi.string().uuid().required(),
  }),
};

export default {
  createSticker,
  getAllStickers,
  getStickerById,
  getStickersBySubnicheId,
  getStickersByCategoryId,
  updateSticker,
  deleteSticker,
};
