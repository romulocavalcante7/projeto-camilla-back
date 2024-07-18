import Joi from "joi";

const createSubniche = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    categoryId: Joi.string().uuid().required(),
    attachmentId: Joi.string().uuid().optional(),
  }),
};

const getAllSubniches = {
  query: Joi.object().keys({
    search: Joi.string().optional(),
    page: Joi.string().optional(),
    pageSize: Joi.string().optional(),
    sortField: Joi.string().optional(),
    sortOrder: Joi.string().optional(),
  }),
};

const getSubnicheById = {
  params: Joi.object().keys({
    subnicheId: Joi.string().uuid().required(),
  }),
};

const updateSubniche = {
  params: Joi.object().keys({
    subnicheId: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      categoryId: Joi.string().uuid(),
      attachmentId: Joi.string().uuid().optional(),
    })
    .min(1),
};

const deleteSubniche = {
  params: Joi.object().keys({
    subnicheId: Joi.string().uuid().required(),
  }),
};

const getSubnichesByCategoryId = {
  params: Joi.object().keys({
    categoryId: Joi.string().uuid().required(),
  }),
};

export default {
  createSubniche,
  getAllSubniches,
  getSubnicheById,
  updateSubniche,
  deleteSubniche,
  getSubnichesByCategoryId,
};
