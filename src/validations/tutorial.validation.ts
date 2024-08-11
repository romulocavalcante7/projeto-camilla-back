import Joi from "joi";

const createTutorial = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    youtubeLink: Joi.string().uri().required(),
    attachmentId: Joi.string().uuid().optional(),
  }),
};

const getAllTutorials = {
  query: Joi.object().keys({
    search: Joi.string().optional(),
    page: Joi.string().optional(),
    pageSize: Joi.string().optional(),
    sortField: Joi.string().optional(),
    sortOrder: Joi.string().optional(),
    importantFirst: Joi.string().optional(),
  }),
};

const getTutorialById = {
  params: Joi.object().keys({
    tutorialId: Joi.string().uuid().required(),
  }),
};

const updateTutorial = {
  params: Joi.object().keys({
    tutorialId: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      youtubeLink: Joi.string().uri().optional(),
      attachmentId: Joi.string().uuid().optional(),
    })
    .min(1),
};

const deleteTutorial = {
  params: Joi.object().keys({
    tutorialId: Joi.string().uuid().required(),
  }),
};

export default {
  createTutorial,
  getAllTutorials,
  getTutorialById,
  updateTutorial,
  deleteTutorial,
};
