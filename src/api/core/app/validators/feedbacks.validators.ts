import Joi from 'joi';

// POST /feedbacks
const createFeedbackSchema = Joi.object({
  title: Joi.string().trim().min(5).max(120).required(),
  short_description: Joi.string()
    .min(5)
    .max(120)
    .trim()
    .optional()
    .default(null),
  long_description: Joi.string().min(5).max(255).trim().required(),

  author_name: Joi.string().min(3).max(120).trim().required(),
  public_email: Joi.string().min(5).max(180).trim().required(),
  github_username: Joi.string().min(3).max(180).trim().required(),

  allow_gravatar: Joi.boolean().optional().default(true),
  allow_pinned: Joi.boolean().optional().default(true),
  is_critical: Joi.boolean().optional().default(false),
});

// PUT /feedbacks
const updateFeedbackSchema = createFeedbackSchema;

export { createFeedbackSchema, updateFeedbackSchema };
