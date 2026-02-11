import { NotFoundException, Injectable } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository';
import {
  FilmListItemDto,
  FilmScheduleItemDto,
  FilmScheduleListResponseDto,
  FilmsListResponseDto,
} from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async getFilms(): Promise<FilmsListResponseDto> {
    const films = await this.filmsRepository.findAll();
    const items: FilmListItemDto[] = films.map((f) => ({
      id: f.id,
      title: f.title,
      rating: f.rating,
      director: f.director,
      tags: f.tags,
      image: f.image,
      cover: f.cover,
      about: f.about,
      description: f.description,
    }));
    return {
      total: items.length,
      items,
    };
  }

  async getFilmSchedule(id: string): Promise<FilmScheduleListResponseDto> {
    const film = await this.filmsRepository.findById(id);
    if (!film) {
      throw new NotFoundException('Фильм не найден');
    }
    const items: FilmScheduleItemDto[] = film.schedule.map((s) => ({
      id: s.id,
      daytime: s.daytime,
      hall: String(s.hall),
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken,
    }));
    return {
      total: items.length,
      items,
    };
  }
}
