import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilmEntity, ScheduleEntity } from '../films/entities/films.entities';

export interface FilmSchedule {
  id: string;
  daytime: string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export interface Film {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  image: string;
  cover: string;
  title: string;
  about: string;
  description: string;
  schedule: FilmSchedule[];
}

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectRepository(FilmEntity)
    private filmRepository: Repository<FilmEntity>,
    @InjectRepository(ScheduleEntity)
    private scheduleRepository: Repository<ScheduleEntity>,
  ) {}

  async findAll(): Promise<Film[]> {
    const films = await this.filmRepository.find({
      relations: ['schedule'],
    });

    return films.map((film) => this.mapToFilm(film));
  }

  async findById(id: string): Promise<Film | undefined> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedule'],
    });

    return film ? this.mapToFilm(film) : undefined;
  }

  async addTakenSeat(
    filmId: string,
    sessionId: string,
    seatKey: string,
  ): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: sessionId, filmId },
    });

    if (schedule) {
      const taken = schedule.taken
        ? schedule.taken.split(',').filter(Boolean)
        : [];

      if (!taken.includes(seatKey)) {
        taken.push(seatKey);
        schedule.taken = taken.join(',');
        await this.scheduleRepository.save(schedule);
      }
    }
  }

  private mapToFilm(entity: FilmEntity): Film {
    return {
      id: entity.id,
      rating: entity.rating,
      director: entity.director,
      tags: entity.tags ? entity.tags.split(',').map((tag) => tag.trim()) : [],
      image: entity.image,
      cover: entity.cover,
      title: entity.title,
      about: entity.about,
      description: entity.description,
      schedule: entity.schedule
        ? entity.schedule.map((s) => ({
            id: s.id,
            daytime: s.daytime,
            hall: s.hall,
            rows: s.rows,
            seats: s.seats,
            price: s.price,
            taken: s.taken ? s.taken.split(',').filter(Boolean) : [],
          }))
        : [],
    };
  }
}
