const Joi = require('joi');

// Auth validation schemas
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must be less than 50 characters',
      'any.required': 'Name is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const verifySchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Verification token is required'
    })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required'
    })
});

// User data validation schemas
const profileUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional(),
  avatar: Joi.string()
    .uri()
    .optional(),
  preferences: Joi.object({
    theme: Joi.string()
      .valid('light', 'dark', 'auto')
      .optional(),
    locale: Joi.string()
      .length(2)
      .optional(),
    notifications: Joi.boolean()
      .optional()
  }).optional()
});

const selectionsUpdateSchema = Joi.object({
  data: Joi.object({
    language: Joi.string().allow('').optional(),
    uiTesting: Joi.string().allow('').optional(),
    testFramework: Joi.string().allow('').optional(),
    bddFramework: Joi.string().allow('').optional(),
    mobileTesting: Joi.string().allow('').optional(),
    buildTool: Joi.string().allow('').optional(),
    apiTesting: Joi.string().allow('').optional(),
    database: Joi.string().allow('').optional(),
    cicd: Joi.string().allow('').optional(),
    versionControl: Joi.alternatives().try(
      Joi.string().allow(''),
      Joi.array().items(Joi.string())
    ).optional(),
    testManagement: Joi.string().allow('').optional()
  }).required(),
  version: Joi.number()
    .integer()
    .min(1)
    .required()
});

const progressUpdateSchema = Joi.object({
  tutorialId: Joi.string()
    .required(),
  sectionId: Joi.string()
    .required(),
  status: Joi.string()
    .valid('not_started', 'in_progress', 'completed')
    .required(),
  currentStep: Joi.number()
    .integer()
    .min(0)
    .required(),
  percent: Joi.number()
    .min(0)
    .max(100)
    .required(),
  version: Joi.number()
    .integer()
    .min(1)
    .required()
});

const noteCreateSchema = Joi.object({
  tutorialId: Joi.string()
    .required(),
  content: Joi.string()
    .min(1)
    .max(5000)
    .required()
});

const noteUpdateSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(5000)
    .required()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  selectionsUpdateSchema,
  progressUpdateSchema,
  noteCreateSchema,
  noteUpdateSchema,
  validate
};



