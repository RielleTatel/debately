export type ApiResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export type ActionResult<T = void> = ApiResponse<T>

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function err(error: string, code?: string): ApiResponse<never> {
  return { success: false, error, code }
}
