// ---------------------------------------------------------------------------
// AppError separates a technical message (for console/devtools) from a
// user-facing message (safe, friendly, shown in the UI). Always throw/catch
// AppError at the service boundary so components never need to know about
// Supabase/Kakao error shapes.
// ---------------------------------------------------------------------------

export class AppError extends Error {
  readonly userMessage: string
  readonly devMessage: string
  readonly cause?: unknown

  constructor(userMessage: string, devMessage: string, cause?: unknown) {
    super(devMessage)
    this.name = 'AppError'
    this.userMessage = userMessage
    this.devMessage = devMessage
    this.cause = cause

    if (cause) {
      // eslint-disable-next-line no-console
      console.error(`[WEDDING MAP] ${devMessage}`, cause)
    } else {
      // eslint-disable-next-line no-console
      console.error(`[WEDDING MAP] ${devMessage}`)
    }
  }
}

export function toAppError(userMessage: string, devPrefix: string, err: unknown): AppError {
  if (err instanceof AppError) return err
  const detail = err instanceof Error ? err.message : String(err)
  return new AppError(userMessage, `${devPrefix}: ${detail}`, err)
}
