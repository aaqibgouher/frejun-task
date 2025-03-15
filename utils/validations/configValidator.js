const Joi = require("joi");

const updateConfigSchema = Joi.object({
  total_confirmed_berths_config: Joi.number().integer().min(1).messages({
    "number.base": "Total confirmed berths config must be a number.",
    "number.integer": "Total confirmed berths config must be an integer.",
    "number.min": "Total confirmed berths config must be at least 1.",
  }),

  total_rac_berths_config: Joi.number().integer().min(1).messages({
    "number.base": "Total RAC berths config must be a number.",
    "number.integer": "Total RAC berths config must be an integer.",
    "number.min": "Total RAC berths config must be at least 1.",
  }),

  total_waiting_list_berths_config: Joi.number().integer().min(1).messages({
    "number.base": "Total waiting list berths config must be a number.",
    "number.integer": "Total waiting list berths config must be an integer.",
    "number.min": "Total waiting list berths config must be at least 1.",
  }),

  total_confirmed_berths: Joi.number().integer().min(0).messages({
    "number.base": "Total confirmed berths must be a number.",
    "number.integer": "Total confirmed berths must be an integer.",
    "number.min": "Total confirmed berths cannot be negative.",
  }),

  total_rac_berths: Joi.number().integer().min(0).messages({
    "number.base": "Total RAC berths must be a number.",
    "number.integer": "Total RAC berths must be an integer.",
    "number.min": "Total RAC berths cannot be negative.",
  }),

  total_waiting_list_berths: Joi.number().integer().min(0).messages({
    "number.base": "Total waiting list berths must be a number.",
    "number.integer": "Total waiting list berths must be an integer.",
    "number.min": "Total waiting list berths cannot be negative.",
  }),

  fare: Joi.number().integer().min(0).messages({
    "number.base": "Fare must be a number.",
    "number.integer": "Fare must be an integer.",
    "number.min": "Fare cannot be negative.",
  }),

  rac_fare: Joi.number().integer().min(0).messages({
    "number.base": "RAC fare must be a number.",
    "number.integer": "RAC fare must be an integer.",
    "number.min": "RAC fare cannot be negative.",
  }),

  waiting_list_fare: Joi.number().integer().min(0).messages({
    "number.base": "Waiting list fare must be a number.",
    "number.integer": "Waiting list fare must be an integer.",
    "number.min": "Waiting list fare cannot be negative.",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });

module.exports = { updateConfigSchema };
