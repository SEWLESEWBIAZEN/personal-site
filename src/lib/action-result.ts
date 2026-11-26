export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ActionErrorCode; requestId: string; fieldErrors?: Record<string, string> };

export type ActionErrorCode = "UNAUTHORIZED" | "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "MEDIA" | "DATABASE" | "UNKNOWN";

/** An error whose message is safe and useful to show to the editor. */
export class UserFacingError extends Error {
  constructor(message: string, readonly code: ActionErrorCode = "VALIDATION") {
    super(message);
    this.name = "UserFacingError";
  }
}

/** Unwraps a result on the client, throwing an Error with the user-facing message. */
export function unwrap<T>(result: ActionResult<T>): T {
  if (result.ok) return result.data;
  const err = new Error(`${result.error} (ref ${result.requestId})`);
  (err as Error & { code?: string }).code = result.code;
  throw err;
}
