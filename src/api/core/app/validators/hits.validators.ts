import Joi from 'joi';

// Path: CREATE - /hits/
const hitCreationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(180).required(),
  description: Joi.string().trim().max(255).optional().default(null),
  website_name: Joi.string().trim().min(3).max(80).required(),
  website_url: Joi.string().trim().min(5).max(255).required(),
  allow_set: Joi.boolean().optional().default(true),
  allow_negative: Joi.boolean().optional().default(false),
  allow_pinned: Joi.boolean().optional().default(true),
});

const hitUpdateSchema = hitCreationSchema;

export { hitCreationSchema, hitUpdateSchema };
