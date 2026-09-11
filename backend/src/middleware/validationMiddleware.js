import { AppError } from './errorMiddleware.js';

/**
 * Higher-order middleware to validate Express requests using Zod schemas
 * @param {object} schemas - { body?: ZodSchema, params?: ZodSchema, query?: ZodSchema }
 */
export const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      next();
    } catch (error) {
      if (error.errors) {
        const formattedDetails = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return next(
          new AppError(
            'Request validation failed',
            400,
            'VALIDATION_ERROR',
            formattedDetails
          )
        );
      }
      next(error);
    }
  };
};

export default validate;
