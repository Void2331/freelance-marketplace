const { z } = require("zod");

/*
|--------------------------------------------------------------------------
| ObjectId path-parameter validation (used with router.param())
|--------------------------------------------------------------------------
|   router.param("id", objectIdParam);
|
| Rejects malformed Mongo ObjectIds with the exact same
| 400 {"success":false,"message":"Invalid ID format"} body that
| errorMiddleware produces for mongoose CastErrors - but before the
| request reaches the controller (and before authentication, since
| router.param callbacks run ahead of route middleware).
|
*/

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const objectIdParam = (req, res, next, value) => {
  const result = objectIdSchema.safeParse(value);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
  }

  next();
};

module.exports = objectIdParam;
