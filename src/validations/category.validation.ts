import Joi from "joi";

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    attachmentId: Joi.string().optional(),
  }),
};

const getAllCategories = {
  query: Joi.object().keys({
    search: Joi.string().optional(),
    page: Joi.string().optional(),
    pageSize: Joi.string().optional(),
    sortField: Joi.string().optional(),
    sortOrder: Joi.string().optional(),
  }),
};

const getCategoryById = {
  params: Joi.object().keys({
    categoryId: Joi.string().uuid().required(),
    attachmentId: Joi.string().optional(),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      attachmentId: Joi.string().uuid().optional(),
    })
    .min(1),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().uuid().required(),
  }),
};

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
