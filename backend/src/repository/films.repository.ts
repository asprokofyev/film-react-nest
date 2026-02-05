import { Inject, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { AppConfig } from '../app.config.provider';
import { FilmDocument, FilmModel } from '../films/films.schema';

@Injectable()
export class FilmsRepository {
  private static isConnected = false;

  constructor(@Inject('CONFIG') private readonly config: AppConfig) {}

  private async ensureConnection() {
    if (FilmsRepository.isConnected) {
      return;
    }
    await mongoose.connect(this.config.database.url);
    FilmsRepository.isConnected = true;
  }

  async findAll(): Promise<FilmDocument[]> {
    await this.ensureConnection();
    const docs = await FilmModel.find().lean();
    return docs as FilmDocument[];
  }

  async findById(id: string): Promise<FilmDocument | undefined> {
    await this.ensureConnection();
    const doc = await FilmModel.findOne({ id }).lean();
    return doc ? (doc as FilmDocument) : undefined;
  }

  async addTakenSeat(
    filmId: string,
    sessionId: string,
    seatKey: string,
  ): Promise<void> {
    await this.ensureConnection();
    await FilmModel.updateOne(
      { id: filmId, 'schedule.id': sessionId },
      { $addToSet: { 'schedule.$.taken': seatKey } },
    );
  }
}
