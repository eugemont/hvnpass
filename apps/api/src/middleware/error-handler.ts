import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import type { ApiErrorBody } from "@heaven-pass/types";
import { HttpError } from "../lib/http-error";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HttpError) {
    const body: ApiErrorBody = { error: { code: err.code, message: err.message, details: err.details } };
    return c.json(body, err.status);
  }

  if (err instanceof ZodError) {
    const body: ApiErrorBody = {
      error: { code: "VALIDATION_ERROR", message: "Invalid request", details: err.flatten() },
    };
    return c.json(body, 400);
  }

  if (err instanceof HTTPException) {
    const body: ApiErrorBody = { error: { code: "HTTP_ERROR", message: err.message } };
    return c.json(body, err.status);
  }

  console.error(err);
  const body: ApiErrorBody = { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } };
  return c.json(body, 500);
};
