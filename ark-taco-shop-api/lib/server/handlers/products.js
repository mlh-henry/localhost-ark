'use strict'

const database = require('../../database')
const utils = require('../utils')

exports.index = {
  async handler (request, h) {
    const products = await database.paginateProduct(utils.paginate(request))

    return utils.toPagination(request, products, 'product')
  }
}
