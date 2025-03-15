const Joi = require("joi");

const addPassengerBerthSchema = Joi.object({
  berthId: Joi.string().uuid().required().messages({
    "string.base": "Berth ID must be a string.",
    "string.guid": "Berth ID must be a valid UUID.",
    "any.required": "Berth ID is required.",
  }),
  passengerId: Joi.string().uuid().required().messages({
    "string.base": "Passenger ID must be a string.",
    "string.guid": "Passenger ID must be a valid UUID.",
    "any.required": "Passenger ID is required.",
  }),
});

module.exports = {
  addPassengerBerthSchema,
};
