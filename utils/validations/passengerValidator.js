const Joi = require("joi");
const { GENDER, PASSENGER_STATUS } = require("../constants");

const addPassengerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.base": "Name must be a string.",
    "string.min": "Name must be at least 2 characters long.",
    "string.max": "Name must not exceed 50 characters.",
    "any.required": "Name is required.",
  }),

  age: Joi.number().integer().min(1).max(100).required().messages({
    "number.base": "Age must be a number.",
    "number.integer": "Age must be an integer.",
    "number.min": "Age must be a positive number.",
    "number.max": "Age cannot exceed 100.",
    "any.required": "Age is required.",
  }),

  gender: Joi.string()
    .valid(...Object.values(GENDER))
    .required()
    .messages({
      "any.only": "Gender must be either MALE or FEMALE.",
      "any.required": "Gender is required.",
    }),

  withChild: Joi.boolean().default(false).when("gender", {
    is: GENDER.FEMALE,
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  status: Joi.string()
    .valid(...Object.values(PASSENGER_STATUS))
    .optional() // Made optional
    .messages({
      "any.only": "Invalid passenger status.",
    }),
});

const addPassengersSchema = Joi.object({
  ticketId: Joi.string().uuid().required().messages({
    "string.base": "Ticket ID must be a string.",
    "string.guid": "Ticket ID must be a valid UUID.",
    "any.required": "Ticket ID is required.",
  }),
  passengers: Joi.array().items(addPassengerSchema).min(1).messages({
    "array.base": "Passengers must be an array.",
    "array.min": "At least one passenger is required.",
  }),
});

module.exports = {
  addPassengerSchema,
  addPassengersSchema,
};
