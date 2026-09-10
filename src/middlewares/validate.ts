import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

const replaceRequestProperty = <K extends "body" | "query" | "params">(
  req: Request,
  key: K,
  value: Request[K] | undefined
) => {
  if (value === undefined) {
    return;
  }

  Object.defineProperty(req, key, {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
};

export const validate =
  (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        }) as any;
        replaceRequestProperty(req, "body", parsed.body);
        replaceRequestProperty(req, "query", parsed.query);
        replaceRequestProperty(req, "params", parsed.params);
        return next();
      } catch (error) {
        if (error instanceof ZodError) {
          const errorMessage = error.issues
            .map((issue) => issue.message)
            .join(", ");
          return res.status(400).json({
            message: errorMessage,
            errors: error.issues,
          });
        }
        return next(error);
      }
    };
