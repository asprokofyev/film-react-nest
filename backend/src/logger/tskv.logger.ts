import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private formatEntry(
    level: string,
    message: any,
    context?: string,
    ...optionalParams: any[]
  ): string {
    const entries: string[] = [];

    // Обязательные поля
    entries.push(`time=${new Date().toISOString()}`);
    entries.push(`level=${level}`);
    entries.push(`message=${this.stringifyValue(message)}`);

    if (context) {
      entries.push(`context=${context}`);
    }

    // Дополнительные параметры
    optionalParams.forEach((param, index) => {
      if (param !== undefined && param !== null) {
        // Для trace не добавляем префикс "Trace:", так как он уже может быть в строке
        const key = param.toString().startsWith('Trace:') ? 'trace' : `param${index + 1}`;
        entries.push(`${key}=${this.stringifyValue(param)}`);
      }
    });

    return entries.join('\t') + '\n';
  }

  private stringifyValue(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (value instanceof Error) {
      // Для ошибок объединяем сообщение и стек
      let errorStr = value.message;
      if (value.stack) {
        errorStr += `\n${value.stack}`;
      }
      return this.escapeSpecialChars(errorStr);
    }
    if (typeof value === 'object') {
      return this.escapeSpecialChars(JSON.stringify(value));
    }
    return this.escapeSpecialChars(String(value));
  }

  private escapeSpecialChars(str: string): string {
    return str
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  log(message: any, context?: string, ...optionalParams: any[]) {
    console.log(this.formatEntry('log', message, context, ...optionalParams));
  }

  error(message: any, trace?: string, context?: string, ...optionalParams: any[]) {
    let errorMessage = message;
    const params = [...optionalParams];
    
    // Если передан trace, добавляем его как отдельный параметр с пометкой
    if (trace) {
      // Не добавляем лишний "Trace:" если он уже есть
      const traceParam = trace.startsWith('Trace:') ? trace : `Trace: ${trace}`;
      params.unshift(traceParam);
    }
    
    console.error(this.formatEntry('error', errorMessage, context, ...params));
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
