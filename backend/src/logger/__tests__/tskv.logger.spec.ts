import { TskvLogger } from '../tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const parseTskvLog = (loggedMessage: string): Map<string, string> => {
    // Убираем символ новой строки в конце
    const cleanMessage = loggedMessage.replace(/\n$/, '');
    const fields = cleanMessage.split('\t');
    const map = new Map();
    fields.forEach(field => {
      const [key, ...valueParts] = field.split('=');
      const value = valueParts.join('='); // Объединяем обратно, если в значении были '='
      map.set(key, value);
    });
    return map;
  };

  const extractFieldValue = (loggedMessage: string, fieldName: string): string | null => {
    const cleanMessage = loggedMessage.replace(/\n$/, '');
    const fields = cleanMessage.split('\t');
    const field = fields.find(f => f.startsWith(`${fieldName}=`));
    if (!field) return null;
    return field.substring(fieldName.length + 1); // +1 для '='
  };

  it('логгер должен быть определен', () => {
    expect(logger).toBeDefined();
  });

  describe('log', () => {
    it('должен логировать простое сообщение в формате TSKV', () => {
      const message = 'Тестовое сообщение';
      
      logger.log(message);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.get('level')).toBe('log');
      expect(parsed.get('message')).toBe(message);
      expect(parsed.get('time')).toBeDefined();
    });

    it('должен логировать сообщение с контекстом', () => {
      const message = 'Тестовое сообщение';
      const context = 'TestContext';
      
      logger.log(message, context);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.get('level')).toBe('log');
      expect(parsed.get('message')).toBe(message);
      expect(parsed.get('context')).toBe(context);
    });

    it('должен логировать сообщение с параметрами', () => {
      const message = 'Тестовое сообщение';
      const param1 = 'param1';
      const param2 = { key: 'value' };
      
      logger.log(message, undefined, param1, param2);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.get('level')).toBe('log');
      expect(parsed.get('message')).toBe(message);
      expect(parsed.get('param1')).toBe(param1);
      expect(parsed.get('param2')).toBe(JSON.stringify(param2));
    });

    it('должен экранировать специальные символы в сообщении', () => {
      const message = 'Сообщение с табуляцией\tи переводом строки\n';
      
      logger.log(message);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      
      // Проверяем, что поля разделены табуляцией
      expect(loggedMessage).toContain('\t');
      
      // Получаем значение message без символа новой строки в конце
      const messageValue = extractFieldValue(loggedMessage, 'message');
      expect(messageValue).toBeDefined();
      
      // Проверяем экранирование
      expect(messageValue).toContain('\\t');
      expect(messageValue).toContain('\\n');
      expect(messageValue).not.toContain('\t');
      expect(messageValue).not.toContain('\n');
    });
  });

  describe('error', () => {
    it('должен логировать ошибку', () => {
      const error = new Error('Тестовая ошибка');
      
      logger.error(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.get('level')).toBe('error');
      expect(parsed.get('message')).toContain('Тестовая ошибка');
    });

    it('должен логировать ошибку с trace', () => {
      const error = new Error('Тестовая ошибка');
      const trace = 'Error: Тестовая ошибка\n    at Test.file:10:5';
      const context = 'TestContext';
      
      logger.error(error, trace, context);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.get('level')).toBe('error');
      expect(parsed.get('message')).toContain('Тестовая ошибка');
      expect(parsed.get('context')).toBe(context);
      
      // Проверяем trace (экранированный)
      const traceValue = parsed.get('trace') || parsed.get('param1');
      expect(traceValue).toBeDefined();
      expect(traceValue).toContain('Trace:');
      expect(traceValue).toContain('Error: Тестовая ошибка');
      expect(traceValue).toContain('Test.file:10:5');
    });

    it('должен экранировать специальные символы в стеке ошибки', () => {
      const error = new Error('Тестовая ошибка');
      error.stack = 'Ошибка в файле\tfile.ts\nстроке 10';
      
      logger.error(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      
      // Проверяем, что поля разделены табуляцией
      expect(loggedMessage).toContain('\t');
      
      // Получаем значение message без символа новой строки в конце
      const messageValue = extractFieldValue(loggedMessage, 'message');
      expect(messageValue).toBeDefined();
      
      // Проверяем экранирование
      expect(messageValue).toContain('\\t');
      expect(messageValue).toContain('\\n');
      expect(messageValue).not.toContain('\t');
      expect(messageValue).not.toContain('\n');
    });

    it('должен логировать строку как ошибку', () => {
      const errorMessage = 'Текст ошибки';
      
      logger.error(errorMessage);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.get('level')).toBe('error');
      expect(parsed.get('message')).toBe(errorMessage);
    });
  });

  describe('warn', () => {
    it('должен логировать предупреждение', () => {
      const message = 'Тестовое предупреждение';
      
      logger.warn(message);
      
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.get('level')).toBe('warn');
      expect(parsed.get('message')).toBe(message);
    });
  });

  describe('debug', () => {
    it('должен логировать отладочное сообщение', () => {
      const message = 'Тестовое отладочное сообщение';
      
      logger.debug(message);
      
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleDebugSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.get('level')).toBe('debug');
      expect(parsed.get('message')).toBe(message);
    });
  });

  describe('verbose', () => {
    it('должен логировать подробное сообщение', () => {
      const message = 'Тестовое подробное сообщение';
      
      logger.verbose(message);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.get('level')).toBe('verbose');
      expect(parsed.get('message')).toBe(message);
    });
  });

  describe('формат TSKV', () => {
    it('должен содержать все обязательные поля', () => {
      logger.log('test');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = parseTskvLog(loggedMessage);
      
      expect(parsed.has('time')).toBe(true);
      expect(parsed.has('level')).toBe(true);
      expect(parsed.has('message')).toBe(true);
    });

    it('должен использовать табуляцию как разделитель полей', () => {
      logger.log('test', 'context', 'param1');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      
      // Проверяем, что поля разделены табуляцией
      expect(loggedMessage).toContain('\t');
      
      // Проверяем, что количество табуляций соответствует количеству полей минус 1
      const fieldCount = loggedMessage.split('\t').length;
      const tabCount = (loggedMessage.match(/\t/g) || []).length;
      expect(tabCount).toBe(fieldCount - 1);
    });

    it('должен заканчиваться символом новой строки', () => {
      logger.log('test');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage.endsWith('\n')).toBe(true);
    });
  });

  describe('обработка разных типов значений', () => {
    it('должен логировать undefined', () => {
      logger.log(undefined);
      
      const parsed = parseTskvLog(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.get('message')).toBe('undefined');
    });

    it('должен логировать null', () => {
      logger.log(null);
      
      const parsed = parseTskvLog(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.get('message')).toBe('null');
    });

    it('должен логировать число', () => {
      logger.log(123);
      
      const parsed = parseTskvLog(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.get('message')).toBe('123');
    });

    it('должен логировать объект', () => {
      const obj = { user: 'test', id: 1 };
      
      logger.log(obj);
      
      const parsed = parseTskvLog(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.get('message')).toBe(JSON.stringify(obj));
    });

    it('должен логировать массив', () => {
      const arr = [1, 2, 3];
      
      logger.log(arr);
      
      const parsed = parseTskvLog(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.get('message')).toBe(JSON.stringify(arr));
    });
  });
});
