import { DevLogger } from '../dev.logger';

describe('DevLogger', () => {
  let logger: DevLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new DevLogger();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('логгер должен быть определен', () => {
    expect(logger).toBeDefined();
  });

  describe('log', () => {
    it('должен логировать простое сообщение', () => {
      const message = 'Тестовое сообщение';
      
      logger.log(message);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('LOG:');
      expect(loggedMessage).toContain(message);
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\]/);
    });

    it('должен логировать сообщение с контекстом', () => {
      const message = 'Тестовое сообщение';
      const context = 'TestContext';
      
      logger.log(message, context);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('LOG:');
      expect(loggedMessage).toContain(message);
      expect(loggedMessage).toContain(`[${context}]`);
    });

    it('должен логировать сообщение с параметрами', () => {
      const message = 'Тестовое сообщение';
      const param1 = 'param1';
      const param2 = { key: 'value' };
      
      logger.log(message, undefined, param1, param2);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('LOG:');
      expect(loggedMessage).toContain(message);
      expect(loggedMessage).toContain(param1);
      expect(loggedMessage).toContain(JSON.stringify(param2));
    });

    it('должен логировать сообщение с контекстом и параметрами', () => {
      const message = 'Тестовое сообщение';
      const context = 'TestContext';
      const param1 = 'param1';
      const param2 = { key: 'value' };
      
      logger.log(message, context, param1, param2);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('LOG:');
      expect(loggedMessage).toContain(message);
      expect(loggedMessage).toContain(`[${context}]`);
      expect(loggedMessage).toContain(param1);
      expect(loggedMessage).toContain(JSON.stringify(param2));
    });
  });

  describe('error', () => {
    it('должен логировать ошибку', () => {
      const error = new Error('Тестовая ошибка');
      
      logger.error(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('ERROR:');
      expect(loggedMessage).toContain(error.message);
    });

    it('должен логировать ошибку с trace', () => {
      const error = new Error('Тестовая ошибка');
      const trace = 'Error: Тестовая ошибка\n    at Test.file:10:5';
      const context = 'TestContext';
      
      logger.error(error, trace, context);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('ERROR:');
      expect(loggedMessage).toContain(error.message);
      expect(loggedMessage).toContain(`[${context}]`);
      expect(loggedMessage).toContain('Trace:');
      expect(loggedMessage).toContain(trace);
    });

    it('должен логировать ошибку с параметрами', () => {
      const error = new Error('Тестовая ошибка');
      const param1 = 'param1';
      const param2 = { key: 'value' };
      
      logger.error(error, undefined, undefined, param1, param2);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('ERROR:');
      expect(loggedMessage).toContain(error.message);
      expect(loggedMessage).toContain(param1);
      expect(loggedMessage).toContain(JSON.stringify(param2));
    });

    it('должен логировать строку как ошибку', () => {
      const errorMessage = 'Текст ошибки';
      
      logger.error(errorMessage);
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('ERROR:');
      expect(loggedMessage).toContain(errorMessage);
    });
  });

  describe('warn', () => {
    it('должен логировать предупреждение', () => {
      const message = 'Тестовое предупреждение';
      
      logger.warn(message);
      
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('WARN:');
      expect(loggedMessage).toContain(message);
    });

    it('должен логировать предупреждение с контекстом', () => {
      const message = 'Тестовое предупреждение';
      const context = 'TestContext';
      
      logger.warn(message, context);
      
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('WARN:');
      expect(loggedMessage).toContain(message);
      expect(loggedMessage).toContain(`[${context}]`);
    });
  });

  describe('debug', () => {
    it('должен логировать отладочное сообщение', () => {
      const message = 'Тестовое отладочное сообщение';
      
      logger.debug(message);
      
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleDebugSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('DEBUG:');
      expect(loggedMessage).toContain(message);
    });
  });

  describe('verbose', () => {
    it('должен логировать подробное сообщение', () => {
      const message = 'Тестовое подробное сообщение';
      
      logger.verbose(message);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('VERBOSE:');
      expect(loggedMessage).toContain(message);
    });
  });

  describe('обработка разных типов значений', () => {
    it('должен логировать undefined', () => {
      logger.log(undefined);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('undefined');
    });

    it('должен логировать null', () => {
      logger.log(null);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('null');
    });

    it('должен логировать число', () => {
      logger.log(123);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('123');
    });

    it('должен логировать объект', () => {
      const obj = { user: 'test', id: 1 };
      
      logger.log(obj);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain(JSON.stringify(obj));
    });

    it('должен логировать массив', () => {
      const arr = [1, 2, 3];
      
      logger.log(arr);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain(JSON.stringify(arr));
    });
  });
});
