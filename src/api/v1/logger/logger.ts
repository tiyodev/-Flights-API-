import chalk from 'chalk';
import HttpError from '../common/error/http_error';

const LoggerLevel = {
  ALL: 'ALL',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  ERROR: 'ERROR',
  OFF: 'OFF',
};

type LoggerColor = 'green' | 'blue';

type LogParams = {
  data: any;
  color?: LoggerColor;
};

class Logger {
  private static instance: Logger;

  private constructor() {
    this.logDebug('Create an instance of Logger');
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message: string, params?: LogParams[]): void {
    if (params) {
      const parameters = params.reduce((acc: string[], cur: LogParams) => {
        if (cur.color && chalk[cur.color]) {
          acc = [...acc, chalk[cur.color](cur.data)];
        } else {
          acc = [...acc, cur.data];
        }
        return acc;
      }, []);

      console.log(message, ...parameters);
    } else {
      console.log(message);
    }
  }

  logDebug(message: string): void {
    if (process.env.LOGGER_LEVEL === LoggerLevel.OFF) return;

    if (process.env.LOGGER_LEVEL === LoggerLevel.ALL || process.env.LOGGER_LEVEL === LoggerLevel.DEBUG) {
      console.error(`${new Date(Date.now()).toISOString()}: ${chalk.gray(message)}`);
    }
  }

  logInfo(message: string): void {
    if (process.env.LOGGER_LEVEL === LoggerLevel.OFF) return;

    if (process.env.LOGGER_LEVEL === LoggerLevel.ALL || process.env.LOGGER_LEVEL === LoggerLevel.INFO) {
      console.info(`${new Date(Date.now()).toISOString()}: ${message}`);
    }
  }

  logError(error: Error | HttpError): void {
    if (process.env.LOGGER_LEVEL === LoggerLevel.OFF) return;
    if (
      process.env.LOGGER_LEVEL === LoggerLevel.ALL ||
      process.env.LOGGER_LEVEL === LoggerLevel.ERROR ||
      process.env.LOGGER_LEVEL === LoggerLevel.DEBUG
    ) {
      console.error(`${new Date(Date.now()).toISOString()}: ${chalk.red(error?.stack || error)}`);
    } else {
      console.error(`${new Date(Date.now()).toISOString()}: ${chalk.red(error.toString())}`);
    }
  }
}

export default Logger.getInstance();
