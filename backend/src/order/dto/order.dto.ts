export class TicketDto {
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
}

export class CreateOrderRequestDto {
  email: string;
  phone: string;
  tickets: TicketDto[];
}

export class OrderResultDto extends TicketDto {
  id: string;
}

export class CreateOrderResponseDto {
  total: number;
  items: OrderResultDto[];
}
