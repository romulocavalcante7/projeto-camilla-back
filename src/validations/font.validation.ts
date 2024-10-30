import Joi from "joi";

const createFont = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    attachmentId: Joi.string().uuid().optional(),
  }),
};

const getAllFonts = {
  query: Joi.object().keys({
    search: Joi.string().optional(),
    page: Joi.string().optional(),
    pageSize: Joi.string().optional(),
    sortField: Joi.string().optional(),
    sortOrder: Joi.string().optional(),
  }),
};

const getFontById = {
  params: Joi.object().keys({
    fontId: Joi.string().uuid().required(),
  }),
};

const updateFont = {
  params: Joi.object().keys({
    fontId: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      attachmentId: Joi.string().uuid().optional(),
    })
    .min(1),
};

const deleteFont = {
  params: Joi.object().keys({
    fontId: Joi.string().uuid().required(),
  }),
};

export default {
  createFont,
  getAllFonts,
  getFontById,
  updateFont,
  deleteFont,
};
