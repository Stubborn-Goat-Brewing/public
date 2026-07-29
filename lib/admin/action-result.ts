/**
 * Shared shape returned by the admin server actions.
 *
 * `eventId` is the canonical name for a created/updated row id; older call
 * sites used `id`, so both are accepted when reading a result.
 */
export type ActionResultLike = {
  ok: boolean
  error?: string
  fieldErrors?: Record<string, string>
  eventId?: string
  id?: string
}

const FORWARD_FAILED =
  "The server did not confirm the change. Reload the page to check whether it saved."

/**
 * Normalises whatever a server action hands back.
 *
 * A server action can resolve to `undefined` even when nothing threw: if Next
 * cannot forward the action response (it logs
 * `failed to forward action response [TypeError: fetch failed]`, which happens
 * when the post-action redirect target cannot be fetched), the client promise
 * settles with no value. Reading `result.ok` off that crashes the component
 * with an opaque `Cannot read properties of undefined` TypeError and the whole
 * form unmounts, so the outcome is treated as an unconfirmed write instead.
 */
export function normalizeActionResult(result: ActionResultLike | undefined | null): {
  ok: boolean
  error?: string
  fieldErrors?: Record<string, string>
  rowId?: string
} {
  if (!result || typeof result !== "object") {
    return { ok: false, error: FORWARD_FAILED }
  }

  return {
    ok: result.ok === true,
    error: result.error,
    fieldErrors: result.fieldErrors,
    rowId: result.eventId ?? result.id,
  }
}
