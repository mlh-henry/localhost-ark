'use strict'

const Joi = require('joi')

var productSchema = Joi.object().keys({
  name: Joi.string().required(),
  code: Joi.string().required(),
  description: Joi.string().required(),
  imageUrl: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number().integer().required()
})

var arrayProductSchema = Joi.array().items(productSchema)

exports.createInventory = {
  payload: Joi.alternatives().try(productSchema, arrayProductSchema)
}
