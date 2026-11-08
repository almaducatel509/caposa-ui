/**
 * Caposa Logger Utility
 * Compatible côté client (navigateur) et côté serveur (Node.js / PM2).
 *
 * Permet de centraliser et structurer tous les logs de l'application
 * avec gestion des niveaux de criticité, horodatage et contexte de module.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

function getActiveLogLevel(): LogLevel {
  const envLevel = (
    process.env.NEXT_PUBLIC_LOG_LEVEL ||
    process.env.LOG_LEVEL ||
    ''
  ).toLowerCase() as LogLevel;

  if (envLevel in LOG_LEVELS) {
    return envLevel;
  }

  // En production, ne pas polluer les logs avec debug/info par défaut
  return process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

function normalizeArg(arg: any): any {
  if (arg instanceof Error) {
    const errorObj: Record<string, any> = {
      message: arg.message,
      stack: arg.stack,
    };
    if ((arg as any).response) {
      errorObj.status = (arg as any).response.status;
      errorObj.data = (arg as any).response.data;
    }
    return errorObj;
  }
  return arg;
}

export class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  /**
   * Crée un sous-logger avec un préfixe de contexte spécifique.
   * Exemple : const authLogger = logger.withContext('Auth');
   */
  public withContext(context: string): Logger {
    return new Logger(context);
  }

  private shouldLog(level: LogLevel): boolean {
    const currentLevel = getActiveLogLevel();
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
  }

  private print(level: 'debug' | 'info' | 'warn' | 'error', message: string, args: any[]) {
    if (!this.shouldLog(level)) return;

    const timestamp = formatTimestamp();
    const tag = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    const normalizedArgs = args.map(normalizeArg);

    switch (level) {
      case 'debug':
        console.debug(`${tag} ${message}`, ...normalizedArgs);
        break;
      case 'info':
        console.info(`${tag} ${message}`, ...normalizedArgs);
        break;
      case 'warn':
        console.warn(`${tag} ${message}`, ...normalizedArgs);
        break;
      case 'error':
        console.error(`${tag} ${message}`, ...normalizedArgs);
        break;
    }
  }

  public debug(message: string, ...args: any[]) {
    this.print('debug', message, args);
  }

  public info(message: string, ...args: any[]) {
    this.print('info', message, args);
  }

  public warn(message: string, ...args: any[]) {
    this.print('warn', message, args);
  }

  public error(message: string, ...args: any[]) {
    this.print('error', message, args);
  }
}

// Instance globale par défaut
export const logger = new Logger('App');

// Helper pour instancier un logger avec un contexte spécifique
export function createLogger(context: string): Logger {
  return new Logger(context);
}

export default logger;
