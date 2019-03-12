"use strict";

import Joi from "joi";

const productSchema = Joi.object().keys({
  name: Joi.string().required(),
  code: Joi.string().required(),
  description: Joi.string().required(),
  imageUrl: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number()
    .integer()
    .required()
});

const arrayProductSchema = Joi.array().items(productSchema);

export default {
  createInventory: {
    payload: Joi.alternatives().try(productSchema, arrayProductSchema)
  }
};
