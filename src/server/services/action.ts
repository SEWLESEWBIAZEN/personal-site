import "server-only";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { UserFacingError, type ActionResult } from "@/lib/action-result";
import { errorFields, logger, newRequestId } from "@/lib/logger";

function describeZod(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    fieldErrors[key] ??= issue.message;
  }
  const first = error.issues[0];
  const where = first?.path.length ? ` (${first.path.join(".")})` : "";
  const message = first?.path[0] === "content"
    ? `The document could not be validated${where}: ${first.message}`
    : `${first?.message ?? "Invalid input"}${where}`;
  return { message, fieldErrors };
}

/**
 * Runs a mutating Server Action: checks the admin session, logs the attempt and its
 * outcome with a request id, and turns failures into an actionable result instead of
 * the generic production "Server Components render" error.
 */
export async function runAction<T>(
  operation: string,
  context: Record<string, unknown>,
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  const requestId = newRequestId();
  const started = Date.now();
  try {
    await requireAdmin();
  } catch {
    logger.warn("action.unauthorized", { requestId, operation });
    return { ok: false, code: "UNAUTHORIZED", error: "Your session has expired. Sign in again; your draft is kept on this device.", requestId };
  }

  logger.info("action.start", { requestId, operation, ...context });
  try {
    const data = await fn();
    logger.info("action.success", { requestId, operation, ms: Date.now() - started, ...context });
    return { ok: true, data };
  } catch (error) {
    const base = { requestId, operation, ms: Date.now() - started, ...context };
    if (error instanceof ZodError) {
      const { message, fieldErrors } = describeZod(error);
      logger.warn("action.validation_failed", { ...base, issues: Object.keys(fieldErrors).slice(0, 10) });
      return { ok: false, code: "VALIDATION", error: message, fieldErrors, requestId };
    }
    if (error instanceof UserFacingError) {
      logger.warn("action.rejected", { ...base, code: error.code, errorMessage: error.message });
      return { ok: false, code: error.code, error: error.message, requestId };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error("action.database_failed", { ...base, ...errorFields(error) });
      if (error.code === "P2025") return { ok: false, code: "NOT_FOUND", error: "Something this save depends on (the item itself, its category or a tag) no longer exists. Reload and try again.", requestId };
      if (error.code === "P2002") return { ok: false, code: "CONFLICT", error: "A record with the same unique value already exists.", requestId };
      return { ok: false, code: "DATABASE", error: "The database rejected the save. Nothing was changed; try again.", requestId };
    }
    if (error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientUnknownRequestError || error instanceof Prisma.PrismaClientRustPanicError || error instanceof Prisma.PrismaClientValidationError) {
      logger.error("action.database_failed", { ...base, ...errorFields(error) });
      return { ok: false, code: "DATABASE", error: "Could not reach or write to the database. Nothing was changed; try again.", requestId };
    }
    logger.error("action.failed", { ...base, ...errorFields(error) });
    return { ok: false, code: "UNKNOWN", error: "Saving failed unexpectedly. Your draft is kept on this device; try again.", requestId };
  }
}
