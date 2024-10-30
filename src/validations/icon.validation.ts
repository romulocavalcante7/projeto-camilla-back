import Joi from "joi";

const createIcon = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    attachmentId: Joi.string().uuid().optional(),
  }),
};

const getAllIcons = {
  query: Joi.object().keys({
    search: Joi.string().optional(),
    page: Joi.string().optional(),
    pageSize: Joi.string().optional(),
    sortField: Joi.string().optional(),
    sortOrder: Joi.string().optional(),
  }),
};

const getIconById = {
  params: Joi.object().keys({
    iconId: Joi.string().uuid().required(),
  }),
};

const updateIcon = {
  params: Joi.object().keys({
    iconId: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      attachmentId: Joi.string().uuid().optional(),
    })
    .min(1),
};

const deleteIcon = {
  params: Joi.object().keys({
    iconId: Joi.string().uuid().required(),
  }),
};

const markIconAsImportant = {
  body: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

const removeIconImportant = {
  body: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

const setIconDisplayOrder = {
  body: Joi.object().keys({
    id: Joi.string().uuid().required(),
    displayOrder: Joi.number().required(),
  }),
};

export default {
  createIcon,
  getAllIcons,
  getIconById,
  updateIcon,
  deleteIcon,
  markIconAsImportant,
  removeIconImportant,
  setIconDisplayOrder,
};
