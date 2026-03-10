import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  private formatEntry(
    level: string,
    message: any,
    context?: string,
    ...optionalParams: any[]
  ): string {
    const logEntry: any = {
      time: new Date().toISOString(),
      level,
      message: this.stringifyValue(message),
    };

    if (context) {
      logEntry.context = context;
    }

    if (optionalParams && optionalParams.length > 0) {
      logEntry.params = optionalParams.map(p => this.stringifyValue(p));
    }

    return JSON.stringify(logEntry) + '\n';
  }

  private stringifyValue(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (value instanceof Error) {
      return `${value.message}${value.stack ? `\n${value.stack}` : ''}`;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  log(message: any, context?: string, ...optionalParams: any[]) {
    console.log(this.formatEntry('log', message, context, ...optionalParams));
  }

  error(message: any, trace?: string, context?: string, ...optionalParams: any[]) {
    const formatted = this.formatEntry(
      'error',
      message,
      context,
      trace ? `Trace: ${trace}` : '',
      ...optionalParams,
    );
    console.error(formatted);
  }

  warn(message: any, context?: string, ...optionalParams: any[]) {
    console.warn(this.formatEntry('warn', message, context, ...optionalParams));
  }

  debug(message: any, context?: string, ...optionalParams: any[]) {
    console.debug(this.formatEntry('debug', message, context, ...optionalParams));
  }

  verbose(message: any, context?: string, ...optionalParams: any[]) {
    console.log(this.formatEntry('verbose', message, context, ...optionalParams));
  }
}
