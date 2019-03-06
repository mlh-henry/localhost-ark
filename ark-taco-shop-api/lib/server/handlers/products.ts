"use strict";

import database from "../../database";
import utils from "../utils";

exports.index = {
    async handler(request, h) {
        // @ts-ignore
        const products = await database.paginateProduct(utils.paginate(request));

        return utils.toPagination(request, products, "product");
    },
};
