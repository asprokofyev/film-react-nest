import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderRequestDto, CreateOrderResponseDto } from '../dto/order.dto';
import { OrderController } from '../order.controller';
import { OrderService } from '../order.service';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    createOrder: jest.fn(),
  };
	// моковые данные запроса на создание заказа
  const mockValidOrderRequest: CreateOrderRequestDto = {
    email: 'test@example.com',
    phone: '+1234567890',
    tickets: [
      {
        film: 'film-123',
        session: 'session-456',
        daytime: '2024-06-28T10:00:53+03:00',
        row: 3,
        seat: 5,
        price: 350,
      },
      {
        film: 'film-123',
        session: 'session-456',
        daytime: '2024-06-28T10:00:53+03:00',
        row: 3,
        seat: 6,
        price: 350,
      },
    ],
  };
	// моковые данные ортвета при создании заказа
  const mockOrderResponse: CreateOrderResponseDto = {
    total: 2,
    items: [
      {
        id: 'order-1',
        film: 'film-123',
        session: 'session-456',
        daytime: '2024-06-28T10:00:53+03:00',
        row: 3,
        seat: 5,
        price: 350,
      },
      {
        id: 'order-2',
        film: 'film-123',
        session: 'session-456',
        daytime: '2024-06-28T10:00:53+03:00',
        row: 3,
        seat: 6,
        price: 350,
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder - создание заказа', () => {
    it('должен успешно создавать заказ', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);
      const result = await controller.createOrder(mockValidOrderRequest);
      expect(result).toEqual(mockOrderResponse);
      expect(service.createOrder).toHaveBeenCalledTimes(1);
      expect(service.createOrder).toHaveBeenCalledWith(mockValidOrderRequest);
    });

    it('должен создавать заказ с одним билетом', async () => {
      const singleTicketRequest: CreateOrderRequestDto = {
        email: 'test@example.com',
        phone: '+1234567890',
        tickets: [
          {
            film: 'film-123',
            session: 'session-456',
            daytime: '2024-06-28T10:00:53+03:00',
            row: 3,
            seat: 5,
            price: 350,
          },
        ],
      };
      const singleTicketResponse: CreateOrderResponseDto = {
        total: 1,
        items: [
          {
            id: 'order-1',
            ...singleTicketRequest.tickets[0],
          },
        ],
      };
      mockOrderService.createOrder.mockResolvedValue(singleTicketResponse);
      const result = await controller.createOrder(singleTicketRequest);
      expect(result).toEqual(singleTicketResponse);
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('должен обрабатывать BadRequestException когда массив билетов пуст', async () => {
      const invalidRequest: CreateOrderRequestDto = {
        email: 'test@example.com',
        phone: '+1234567890',
        tickets: [],
      };
      mockOrderService.createOrder.mockRejectedValue(
        new BadRequestException('Нет билетов в заказе'),
      );
      await expect(controller.createOrder(invalidRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.createOrder).toHaveBeenCalledWith(invalidRequest);
    });

    it('должен обрабатывать BadRequestException когда фильм не найден', async () => {
      mockOrderService.createOrder.mockRejectedValue(
        new BadRequestException('Фильм film-123 не найден'),
      );
      await expect(controller.createOrder(mockValidOrderRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.createOrder).toHaveBeenCalledWith(mockValidOrderRequest);
    });

    it('должен обрабатывать BadRequestException когда сеанс не найден', async () => {
      mockOrderService.createOrder.mockRejectedValue(
        new BadRequestException('Сеанс session-456 не найден'),
      );
      await expect(controller.createOrder(mockValidOrderRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('должен обрабатывать BadRequestException когда указано неверное место', async () => {
      mockOrderService.createOrder.mockRejectedValue(
        new BadRequestException('Неверный номер места'),
      );
      await expect(controller.createOrder(mockValidOrderRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('должен обрабатывать BadRequestException когда место уже занято', async () => {
      mockOrderService.createOrder.mockRejectedValue(
        new BadRequestException('Место уже занято'),
      );
      await expect(controller.createOrder(mockValidOrderRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('должен обрабатывать ошибки сервиса', async () => {
      const error = new Error('Ошибка базы данных');
      mockOrderService.createOrder.mockRejectedValue(error);
      await expect(controller.createOrder(mockValidOrderRequest)).rejects.toThrow(
        'Ошибка базы данных',
      );
    });

    it('должен передавать правильные данные запроса в сервис', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);
      await controller.createOrder(mockValidOrderRequest);
      expect(service.createOrder).toHaveBeenCalledWith({
        email: 'test@example.com',
        phone: '+1234567890',
        tickets: expect.arrayContaining([
          expect.objectContaining({
            film: 'film-123',
            session: 'session-456',
            row: 3,
            seat: 5,
          }),
          expect.objectContaining({
            film: 'film-123',
            session: 'session-456',
            row: 3,
            seat: 6,
          }),
        ]),
      });
    });

    it('должен сохранять email и phone в запросе', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);
      await controller.createOrder(mockValidOrderRequest);
      expect(service.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          phone: '+1234567890',
        }),
      );
    });

    it('должен обрабатывать запрос с разными ценами на билеты', async () => {
      const mixedPriceRequest: CreateOrderRequestDto = {
        email: 'test@example.com',
        phone: '+1234567890',
        tickets: [
          {
            film: 'film-123',
            session: 'session-456',
            daytime: '2024-06-28T10:00:53+03:00',
            row: 3,
            seat: 5,
            price: 350,
          },
          {
            film: 'film-123',
            session: 'session-456',
            daytime: '2024-06-28T10:00:53+03:00',
            row: 4,
            seat: 5,
            price: 400,
          },
        ],
      };

      const mixedPriceResponse: CreateOrderResponseDto = {
        total: 2,
        items: [
          {
            id: 'order-1',
            ...mixedPriceRequest.tickets[0],
          },
          {
            id: 'order-2',
            ...mixedPriceRequest.tickets[1],
          },
        ],
      };
      mockOrderService.createOrder.mockResolvedValue(mixedPriceResponse);
      const result = await controller.createOrder(mixedPriceRequest);
      expect(result.items[0].price).toBe(350);
      expect(result.items[1].price).toBe(400);
    });

    it('должен обрабатывать запрос с минимальными данными (только обязательные поля)', async () => {
      const minimalRequest: CreateOrderRequestDto = {
        email: 'test@example.com',
        phone: '+1234567890',
        tickets: [
          {
            film: 'film-123',
            session: 'session-456',
            daytime: '2024-06-28T10:00:53+03:00',
            row: 1,
            seat: 1,
            price: 350,
          },
        ],
      };
      const minimalResponse: CreateOrderResponseDto = {
        total: 1,
        items: [
          {
            id: 'order-1',
            ...minimalRequest.tickets[0],
          },
        ],
      };
      mockOrderService.createOrder.mockResolvedValue(minimalResponse);
      const result = await controller.createOrder(minimalRequest);
      expect(result).toBeDefined();
      expect(result.items[0].row).toBe(1);
      expect(result.items[0].seat).toBe(1);
    });
  });
});
