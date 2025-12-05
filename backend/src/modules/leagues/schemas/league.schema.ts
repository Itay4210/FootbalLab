import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeagueDocument = League & Document;

@Schema({ timestamps: true })
export class League {
  @Prop({ required: true, unique: true })
  name: string; // למשל: Premier League

  @Prop({ required: true })
  country: string; // למשל: England

  @Prop({ default: 1 })
  currentMatchday: number; // איזה מחזור משוחק כרגע (1-38)

  @Prop({ default: '2025/2026' })
  season: string;
}

export const LeagueSchema = SchemaFactory.createForClass(League);