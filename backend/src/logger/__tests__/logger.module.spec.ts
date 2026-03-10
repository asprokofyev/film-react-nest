import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DevLogger } from '../dev.logger';
import { JsonLogger } from '../json.logger';
import { LOGGER_TOKEN, LoggerModule } from '../logger.module';
import { TskvLogger } from '../tskv.logger';

describe('LoggerModule', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('фабрика логгера', () => {
    it('должен создавать DevLogger по умолчанию', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [LoggerModule],
      }).compile();

      const logger = module.get(LOGGER_TOKEN);
      expect(logger).toBeInstanceOf(DevLogger);
    });

    it('должен создавать DevLogger при LOGGER_TYPE=dev', async () => {
      process.env.LOGGER_TYPE = 'dev';
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            ignoreEnvFile: true,
            ignoreEnvVars: false,
          }),
          LoggerModule,
        ],
      }).compile();

      const logger = module.get(LOGGER_TOKEN);
      expect(logger).toBeInstanceOf(DevLogger);
    });

    it('должен создавать JsonLogger при LOGGER_TYPE=json', async () => {
      process.env.LOGGER_TYPE = 'json';
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            ignoreEnvFile: true,
            ignoreEnvVars: false,
          }),
          LoggerModule,
        ],
      }).compile();

      const logger = module.get(LOGGER_TOKEN);
      expect(logger).toBeInstanceOf(JsonLogger);
    });

    it('должен создавать TskvLogger при LOGGER_TYPE=tskv', async () => {
      process.env.LOGGER_TYPE = 'tskv';
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            ignoreEnvFile: true,
            ignoreEnvVars: false,
          }),
          LoggerModule,
        ],
      }).compile();

      const logger = module.get(LOGGER_TOKEN);
      expect(logger).toBeInstanceOf(TskvLogger);
    });

    it('должен обрабатывать неизвестный тип логгера как DevLogger', async () => {
      process.env.LOGGER_TYPE = 'unknown';
      
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            ignoreEnvFile: true,
            ignoreEnvVars: false,
          }),
          LoggerModule,
        ],
      }).compile();

      const logger = module.get(LOGGER_TOKEN);
      expect(logger).toBeInstanceOf(DevLogger);
    });
  });

  it('должен экспортировать все логгеры', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
    }).compile();

    expect(module.get(DevLogger)).toBeInstanceOf(DevLogger);
    expect(module.get(JsonLogger)).toBeInstanceOf(JsonLogger);
    expect(module.get(TskvLogger)).toBeInstanceOf(TskvLogger);
  });

  it('должен быть глобальным модулем', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
    }).compile();

    const logger = module.get(LOGGER_TOKEN);
    expect(logger).toBeDefined();
  });
});
