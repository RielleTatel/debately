export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export const Errors = {
  unauthorized: () => new AppError('UNAUTHORIZED', 'Not authenticated', 401),
  forbidden: () => new AppError('FORBIDDEN', 'Access denied', 403),
  notFound: (resource: string) =>
    new AppError('NOT_FOUND', `${resource} not found`, 404),
  conflict: (msg: string) => new AppError('CONFLICT', msg, 409),
  internal: () => new AppError('INTERNAL_ERROR', 'Internal server error', 500),
} as const
