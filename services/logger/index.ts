type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogContext = Record<string, unknown>

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = { level, message, timestamp: new Date().toISOString(), ...context }
  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => log('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => log('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => log('error', msg, ctx),
}
