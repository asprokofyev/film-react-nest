import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateOrderRequestDto, CreateOrderResponseDto } from './dto/order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() body: CreateOrderRequestDto,
  ): Promise<CreateOrderResponseDto> {
    this.logger.debug(`Создается заказ с данными: ${JSON.stringify(body)}`);

    return this.orderService.createOrder(body);
  }
}
