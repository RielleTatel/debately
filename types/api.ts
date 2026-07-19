export type ApiResponse<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string }

export type ActionResult<T = void> = ApiResponse<T>

export function ok<T>(data: T): ApiResponse<T> {
  return { ok: true, data }
}

export function err(error: string, code?: string): ApiResponse<never> {
  return { ok: false, error, code }
}
