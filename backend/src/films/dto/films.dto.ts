export class FilmListItemDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  image: string;
  cover: string;
  title: string;
  about: string;
  description: string;
}

export class FilmScheduleItemDto {
  id: string;
  daytime: string;
  hall: string;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class FilmsListResponseDto {
  total: number;
  items: FilmListItemDto[];
}

export class FilmScheduleListResponseDto {
  total: number;
  items: FilmScheduleItemDto[];
}
