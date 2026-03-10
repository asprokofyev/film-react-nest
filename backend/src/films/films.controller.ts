import { Controller, Get, Logger, Param } from '@nestjs/common';
import {
  FilmScheduleListResponseDto,
  FilmsListResponseDto,
} from './dto/films.dto';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  private readonly logger = new Logger(FilmsController.name);

  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getFilms(): Promise<FilmsListResponseDto> {
    this.logger.log(`Получаем список фильмов`);

    return this.filmsService.getFilms();
  }

  @Get(':id/schedule')
  async getFilmSchedule(
    @Param('id') id: string,
  ): Promise<FilmScheduleListResponseDto> {
    this.logger.log(`Получаем расписание сеансов для фильма с ID: ${id}`);

    return this.filmsService.getFilmSchedule(id);
  }
}
