import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
	FilmScheduleListResponseDto,
	FilmsListResponseDto,
} from '../dto/films.dto';
import { FilmsController } from '../films.controller';
import { FilmsService } from '../films.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: FilmsService;

  const mockFilmsService = {
    getFilms: jest.fn(),
    getFilmSchedule: jest.fn(),
  };
	// моковые двнные фильмов
  const mockFilmsResponse: FilmsListResponseDto = {
    total: 2,
    items: [
      {
        id: '1',
        title: 'Тестовый фильм 1',
        rating: 8.5,
        director: 'Режиссер 1',
        tags: ['драма', 'комедия'],
        image: '/image1.jpg',
        cover: '/cover1.jpg',
        about: 'О фильме 1',
        description: 'Описание фильма 1',
      },
      {
        id: '2',
        title: 'Тестовый фильм 2',
        rating: 7.8,
        director: 'Режиссер 2',
        tags: ['боевик'],
        image: '/image2.jpg',
        cover: '/cover2.jpg',
        about: 'О фильме 2',
        description: 'Описание фильма 2',
      },
    ],
  };
	// моковые данные расписания
  const mockScheduleResponse: FilmScheduleListResponseDto = {
    total: 3,
    items: [
      {
        id: 'schedule1',
        daytime: '2024-06-28T10:00:53+03:00',
        hall: '1',
        rows: 5,
        seats: 10,
        price: 350,
        taken: ['1:1', '1:2'],
      },
      {
        id: 'schedule2',
        daytime: '2024-06-28T14:00:53+03:00',
        hall: '2',
        rows: 5,
        seats: 10,
        price: 350,
        taken: [],
      },
      {
        id: 'schedule3',
        daytime: '2024-06-28T16:00:53+03:00',
        hall: '3',
        rows: 5,
        seats: 10,
        price: 350,
        taken: ['2:3'],
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    service = module.get<FilmsService>(FilmsService);
  });

  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('getFilms - получение списка фильмов', () => {
    it('должен возвращать все фильмы', async () => {
      mockFilmsService.getFilms.mockResolvedValue(mockFilmsResponse);
      const result = await controller.getFilms();
      expect(result).toEqual(mockFilmsResponse);
      expect(service.getFilms).toHaveBeenCalledTimes(1);
      expect(service.getFilms).toHaveBeenCalledWith();
    });

    it('должен возвращать пустой список, когда фильмов нет', async () => {
      const emptyResponse: FilmsListResponseDto = {
        total: 0,
        items: [],
      };
      mockFilmsService.getFilms.mockResolvedValue(emptyResponse);
      const result = await controller.getFilms();
      expect(result).toEqual(emptyResponse);
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('должен обрабатывать ошибки сервиса', async () => {
      const error = new Error('Ошибка базы данных');
      mockFilmsService.getFilms.mockRejectedValue(error);
      await expect(controller.getFilms()).rejects.toThrow('Ошибка базы данных');
      expect(service.getFilms).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFilmSchedule - получение расписания фильма', () => {
    const filmId = '123';
    it('должен возвращать расписание для существующего фильма', async () => {
      mockFilmsService.getFilmSchedule.mockResolvedValue(mockScheduleResponse);
      const result = await controller.getFilmSchedule(filmId);
      expect(result).toEqual(mockScheduleResponse);
      expect(service.getFilmSchedule).toHaveBeenCalledTimes(1);
      expect(service.getFilmSchedule).toHaveBeenCalledWith(filmId);
    });

    it('должен возвращать пустой список, когда у фильма нет расписания', async () => {
      const emptyScheduleResponse: FilmScheduleListResponseDto = {
        total: 0,
        items: [],
      };
      mockFilmsService.getFilmSchedule.mockResolvedValue(emptyScheduleResponse);
      const result = await controller.getFilmSchedule(filmId);
      expect(result).toEqual(emptyScheduleResponse);
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('должен выбрасывать NotFoundException, когда фильм не существует', async () => {
      mockFilmsService.getFilmSchedule.mockRejectedValue(
        new NotFoundException('Фильм не найден'),
      );
      await expect(controller.getFilmSchedule('несуществующий')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getFilmSchedule).toHaveBeenCalledWith('несуществующий');
    });

    it('должен обрабатывать ошибки сервиса', async () => {
      const error = new Error('Ошибка базы данных');
      mockFilmsService.getFilmSchedule.mockRejectedValue(error);
      await expect(controller.getFilmSchedule(filmId)).rejects.toThrow('Ошибка базы данных');
      expect(service.getFilmSchedule).toHaveBeenCalledTimes(1);
    });

    it('должен передавать правильный id фильма в сервис', async () => {
      mockFilmsService.getFilmSchedule.mockResolvedValue(mockScheduleResponse);
      await controller.getFilmSchedule('test-id-123');
      expect(service.getFilmSchedule).toHaveBeenCalledWith('test-id-123');
    });
  });
});
