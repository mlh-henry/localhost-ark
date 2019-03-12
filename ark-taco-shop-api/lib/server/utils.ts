"use strict";
import { Request } from "hapi";

export interface PaginatedResults<T> {
  results: T[];
  totalCount: Number;
}

export interface PaginableData<T> {
  rows: T[];
  count: Number;
}

export interface PaginationParams {
  offset: number;
  limit: number;
}

export interface HandlerResponse<T> {
  data: T;
}

const paginate = (request: Request): PaginationParams => ({
  offset:
    ((Number(request.query.page) || 1) - 1) *
    (Number(request.query.limit) || 100),
  limit: Number(request.query.limit) || 100
});

const respondWithCollection = <T>(data: T): HandlerResponse<T> => ({ data });
const toPagination = <T>({
  rows: results,
  count: totalCount
}: PaginableData<T>): PaginatedResults<T> => ({
  results,
  totalCount
});

export default {
  paginate,
  respondWithCollection,
  toPagination
};
