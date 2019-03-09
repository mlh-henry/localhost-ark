"use strict";
import { Request } from "hapi";

export interface PaginatedResults {
  results: [Object];
  totalCount: Number;
}

export interface PaginableData {
  rows: [Object];
  count: Number;
}

export interface PaginationParams {
  offset: number;
  limit: number;
}

const paginate = (request: Request): PaginationParams => ({
  offset:
    ((Number(request.query.page) || 1) - 1) *
    (Number(request.query.limit) || 100),
  limit: Number(request.query.limit) || 100
});

const respondWithCollection = (data: Object): Object => ({ data });
const toPagination = ({
  rows: results,
  count: totalCount
}: PaginableData): PaginatedResults => ({
  results,
  totalCount
});

export default {
  paginate,
  respondWithCollection,
  toPagination
};
