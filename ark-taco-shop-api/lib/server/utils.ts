"use strict";

import defaultTransformer from "./transformer";
const Boom = require("boom");

const transformResource = (request, data, transformer = null) => {
    const t = defaultTransformer;
    return t(data);
};

const transformCollection = (request, data, transformer) => {
    return data.map(d => transformResource(request, d, transformer));
};

const paginate = request => {
    return {
        offset: ((request.query.page || 1) - 1) * (request.query.limit || 100),
        limit: request.query.limit || 100,
    };
};

const respondWithResource = (request, data, transformer) => {
    return data ? { data: transformResource(request, data, transformer) } : Boom.notFound();
};

const respondWithCollection = (request, data, transformer) => {
    return { data: transformCollection(request, data, transformer) };
};

const toResource = (request, data, transformer) => {
    return transformResource(request, data, transformer);
};

const toCollection = (request, data, transformer) => {
    return transformCollection(request, data, transformer);
};

const toPagination = (request, data, transformer) => {
    return {
        results: transformCollection(request, data.rows, transformer),
        totalCount: data.count,
    };
};

export default {
    transformResource,
    transformCollection,
    paginate,
    respondWithResource,
    respondWithCollection,
    toResource,
    toCollection,
    toPagination,
};
