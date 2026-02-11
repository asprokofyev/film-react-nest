import { Controller, Get, Param } from '@nestjs/common';
import {
  FilmScheduleListResponseDto,
  FilmsListResponseDto,
} from './dto/films.dto';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getFilms(): Promise<FilmsListResponseDto> {
    return this.filmsService.getFilms();
  }

  @Get(':id/schedule')
  async getFilmSchedule(
    @Param('id') id: string,
  ): Promise<FilmScheduleListResponseDto> {
    return this.filmsService.getFilmSchedule(id);
  }
}
