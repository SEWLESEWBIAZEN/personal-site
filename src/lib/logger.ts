import { randomUUID } from "crypto";

type Level = "info" | "warn" | "error";

// One JSON object per line so platform log collectors can index fields. Never log
// request bodies, document content, credentials or file contents.
function write(level: Level, event: string, fields: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (event: string, fields: Record<string, unknown> = {}) => write("info", event, fields),
  warn: (event: string, fields: Record<string, unknown> = {}) => write("warn", event, fields),
  error: (event: string, fields: Record<string, unknown> = {}) => write("error", event, fields),
};

export function newRequestId() {
  return randomUUID().slice(0, 8);
}

/** Safe, non-sensitive summary of an error for logs. */
export function errorFields(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    return { errorName: error.name, errorMessage: error.message.slice(0, 500), ...(code ? { errorCode: code } : {}) };
  }
  return { errorMessage: String(error).slice(0, 500) };
}
