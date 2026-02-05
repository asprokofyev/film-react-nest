import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FilmsRepository } from '../repository/films.repository';
import {
  CreateOrderRequestDto,
  CreateOrderResponseDto,
  OrderResultDto,
} from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async createOrder(
    req: CreateOrderRequestDto,
  ): Promise<CreateOrderResponseDto> {
    // проверяем наличие билетов в запросе
    if (!Array.isArray(req.tickets) || req.tickets.length === 0) {
      throw new BadRequestException('Нет билетов в заказе');
    }

    const items: OrderResultDto[] = [];

    for (const ticket of req.tickets) {
      const film = await this.filmsRepository.findById(ticket.film);
      // проверяем есть ли фильм
      if (!film) {
        throw new BadRequestException(`Фильм ${ticket.film} не найден`);
      }

      const session = film.schedule.find((s) => s.id === ticket.session);
      // проверяем сеанс
      if (!session) {
        throw new BadRequestException(`Сеанс ${ticket.session} не найден`);
      }

      const key = `${ticket.row}:${ticket.seat}`;
      // проверяем корректность номера места
      if (
        ticket.row < 1 ||
        ticket.row > session.rows ||
        ticket.seat < 1 ||
        ticket.seat > session.seats
      ) {
        throw new BadRequestException('Неверный номер места');
      }
      // проверяем не занято ли уже место
      if (session.taken.includes(key)) {
        throw new BadRequestException('Место уже занято');
      }

      await this.filmsRepository.addTakenSeat(ticket.film, ticket.session, key);

      items.push({
        ...ticket,
        id: randomUUID(),
      });
    }

    return {
      total: items.length,
      items,
    };
  }
}
