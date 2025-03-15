const Joi = require("joi");

// Passenger Schema
const passengerSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),
  age: Joi.number().min(1).max(100).required().messages({
    "number.base": "Age must be a number",
    "number.min": "Minimum 1 age is required",
    "number.max": "Maximum 100 age are allowed",
    "any.required": "Age is required",
  }),
  gender: Joi.string().valid("MALE", "FEMALE").required().messages({
    "any.only": 'Gender must be either "MALE" or "FEMALE"',
    "any.required": "Gender is required",
  }),
  withChild: Joi.boolean().default(false).when("gender", {
    is: "FEMALE",
    then: Joi.optional(), // Optional when FEMALE, default false if not passed
    otherwise: Joi.forbidden(), // If not FEMALE, withChild should not be present
  }),
});

const bookingSchema = Joi.object({
  totalBooking: Joi.number().min(1).max(6).required().messages({
    "number.base": "Total booking must be a number",
    "number.min": "Minimum 1 booking is required",
    "number.max": "Maximum 6 bookings are allowed",
    "any.required": "Total booking is required",
  }),
  passengers: Joi.array()
    .items(passengerSchema)
    .required()
    .custom((value, helpers) => {
      const { totalBooking } = helpers.state.ancestors[0];
      if (value.length !== totalBooking) {
        return helpers.message(
          `Number of passengers (${value.length}) must be equal to totalBooking (${totalBooking})`
        );
      }
      return value;
    }),
  isRac: Joi.boolean().optional().default(false).messages({
    "boolean.base": "isRac must be a boolean value (true/false).",
  }),
  isWL: Joi.boolean().optional().default(false).messages({
    "boolean.base": "isWL must be a boolean value (true/false).",
  }),
});

module.exports = {
  bookingSchema,
};
