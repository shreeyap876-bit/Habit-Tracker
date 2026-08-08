import ApiError from '../utils/ApiError.js';

/**
 * Validates `req[source]` against a Zod schema and exposes the parsed result as
 * `req.valid[source]`, so controllers always read clean, coerced input and
 * never mutate Express' own request properties.
 */
export default function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(ApiError.badRequest(details[0]?.message || 'Invalid request', details));
    }

    req.valid = { ...req.valid, [source]: result.data };
    return next();
  };
}
