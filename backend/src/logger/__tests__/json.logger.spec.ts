import { JsonLogger } from '../json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const parseJsonLog = (loggedMessage: string): any => {
    return JSON.parse(loggedMessage.replace(/\n$/, ''));
  };

  it('логгер должен быть определен', () => {
    expect(logger).toBeDefined();
  });

  describe('log', () => {
    it('должен логировать простое сообщение в формате JSON', () => {
      const message = 'Тестовое сообщение';
      
      logger.log(message);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = parseJsonLog(loggedMessage);
      
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe(message);
      expect(parsed.time).toBeDefined();
      expect(parsed.context).toBeUndefined();
      expect(parsed.params).toBeUndefined();
    });

    it('должен логировать сообщение с контекстом', () => {
      const message = 'Тестовое сообщение';
      const context = 'TestContext';
      
      logger.log(message, context);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const parsed = parseJsonLog(consoleLogSpy.mock.calls[0][0]);
      
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe(message);
      expect(parsed.context).toBe(context);
    });

    it('должен логировать сообщение с параметрами', () => {
      const message = 'Тестовое сообщение';
      const param1 = 'param1';
      const param2 = { key: 'value' };
      
      logger.log(message, undefined, param1, param2);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const parsed = parseJsonLog(consoleLogSpy.mock.calls[0][0]);
      
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe(message);
      expect(parsed.params).toBeDefined();
      expect(parsed.params).toContain(param1);
      expect(parsed.params).toContain(JSON.stringify(param2));
    });

    it('должен логировать сообщение с контекстом и параметрами', () => {
      const message = 'Тестовое сообщение';
      const context = 'TestContext';
      const param1 = 'param1';
      const param2 = { key: 'value' };
      
      logger.log(message, context, param1, param2);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const parsed = parseJsonLog(consoleLogSpy.mock.calls[0][0]);
      
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe(message);
      expect(parsed.context).toBe(context);
      expect(parsed.params).toBeDefined();
      expect(parsed.params).toContain(param1);
      expect(parsed.params).toContain(JSON.stringify(param2));
    });
  });

  describe('error', () => {
    it('должен логировать ошибку в формате JSON', () => {
      const error = new Error('Тестовая ошибка');
      
      logger.error(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const parsed = parseJsonLog(consoleErrorSpy.mock.calls[0][0]);
      
      expect(parsed.level).toBe('error');
      expect(parsed.message).toContain(error.message);
      expect(parsed.time).toBeDefined();
    });

    it('должен логировать ошибку с trace', () => {
      const error = new Error('Тестовая ошибка');
      const trace = 'Error: Тестовая ошибка\n    at Test.file:10:5';
      const context = 'TestContext';
      
      logger.error(error, trace, context);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const parsed = parseJsonLog(consoleErrorSpy.mock.calls[0][0]);
      
      expect(parsed.level).toBe('error');
      expect(parsed.message).toContain(error.message);
      expect(parsed.context).toBe(context);
      expect(parsed.params).toBeDefined();
      expect(parsed.params[0]).toContain('Trace:');
      expect(parsed.params[0]).toContain(trace);
    });

    it('должен логировать ошибку с параметрами', () => {
      const error = new Error('Тестовая ошибка');
      const param1 = 'param1';
      const param2 = { key: 'value' };
      
      logger.error(error, undefined, undefined, param1, param2);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const parsed = parseJsonLog(consoleErrorSpy.mock.calls[0][0]);
      
      expect(parsed.level).toBe('error');
      expect(parsed.message).toContain(error.message);
      expect(parsed.params).toBeDefined();
      expect(parsed.params).toContain(param1);
      expect(parsed.params).toContain(JSON.stringify(param2));
    });
  });

  describe('warn', () => {
    it('должен логировать предупреждение в формате JSON', () => {
      const message = 'Тестовое предупреждение';
      
      logger.warn(message);
      
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const parsed = parseJsonLog(consoleWarnSpy.mock.calls[0][0]);
      
      expect(parsed.level).toBe('warn');
      expect(parsed.message).toBe(message);
    });
  });

  describe('debug', () => {
    it('должен логировать отладочное сообщение в формате JSON', () => {
      const message = 'Тестовое отладочное сообщение';
      
      logger.debug(message);
      
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const parsed = parseJsonLog(consoleDebugSpy.mock.calls[0][0]);
      
      expect(parsed.level).toBe('debug');
      expect(parsed.message).toBe(message);
    });
  });

  describe('verbose', () => {
    it('должен логировать подробное сообщение в формате JSON', () => {
      const message = 'Тестовое подробное сообщение';
      
      logger.verbose(message);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const parsed = parseJsonLog(consoleLogSpy.mock.calls[0][0]);
      
      expect(parsed.level).toBe('verbose');
      expect(parsed.message).toBe(message);
    });
  });

  describe('формат JSON', () => {
    it('должен создавать валидный JSON', () => {
      logger.log('test');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(() => JSON.parse(loggedMessage.replace(/\n$/, ''))).not.toThrow();
    });

    it('должен содержать все обязательные поля', () => {
      logger.log('test');
      
      const parsed = parseJsonLog(consoleLogSpy.mock.calls[0][0]);
      
      expect(parsed).toHaveProperty('time');
      expect(parsed).toHaveProperty('level');
      expect(parsed).toHaveProperty('message');
    });
  });

  describe('обработка разных типов значений', () => {
    it('должен логировать undefined', () => {
      logger.log(undefined);
      
      const parsed = parseJsonLog(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.message).toBe('undefined');
    });

    it('должен логировать null', () => {
      logger.log(null);
      
      const parsed = parseJsonLog(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.message).toBe('null');
    });

    it('должен логировать число', () => {
      logger.log(123);
      
      const parsed = parseJsonLog(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.message).toBe('123');
    });

    it('должен логировать объект', () => {
      const obj = { user: 'test', id: 1 };
      
      logger.log(obj);
      
      const parsed = parseJsonLog(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.message).toBe(JSON.stringify(obj));
    });
  });
});
