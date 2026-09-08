import { ZodError } from "zod";

export type ActionResult = { ok: true } | { ok: false; error: string };

export function toActionError(
  err: unknown,
  fallback = "Something went wrong",
): Error {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return new Error(first?.message ?? "Invalid input");
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  ) {
    return new Error("That username or email is already taken");
  }
  if (err instanceof Error) return err;
  return new Error(fallback);
}

export function actionOk(): ActionResult {
  return { ok: true };
}

export function actionFail(err: unknown): ActionResult {
  return { ok: false, error: toActionError(err).message };
}

export function rethrowAction(err: unknown): never {
  throw toActionError(err);
}
