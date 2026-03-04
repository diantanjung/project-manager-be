import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        }) as any;
        req.body = parsed.body || req.body;
        next();
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
        next(error);
      }
    };
