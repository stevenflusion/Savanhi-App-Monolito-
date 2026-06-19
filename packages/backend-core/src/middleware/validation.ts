import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type RequestPart = "body" | "query" | "params";

function validate(part: RequestPart, schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req[part] = schema.parse(req[part]) as never;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateBody(schema: ZodType) {
  return validate("body", schema);
}

export function validateQuery(schema: ZodType) {
  return validate("query", schema);
}

export function validateParams(schema: ZodType) {
  return validate("params", schema);
}
