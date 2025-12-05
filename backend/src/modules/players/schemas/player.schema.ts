import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlayerDocument = Player & Document;

// הגדרת העמדות המדויקות בכדורגל
export enum PlayerPosition {
  GK = 'GK',
  CB = 'CB', LB = 'LB', RB = 'RB',
  CDM = 'CDM', CM = 'CM', CAM = 'CAM',
  LW = 'LW', RW = 'RW', ST = 'ST'
}

@Schema({ timestamps: true })
export class Player {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true, enum: PlayerPosition }) // הגבלנו לרשימה הסגורה
  position: string; 

  @Prop({ required: true })
  nationality: string;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ default: 100000 })
  marketValue: number;

  // 👇 התיקון הגדול שלך כאן: הפרדת כרטיסים
  @Prop({
    type: Object,
    default: { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 }
  })
  seasonStats: {
    goals: number;
    assists: number;
    matches: number;
    yellowCards: number; // 🟨
    redCards: number;    // 🟥
  };
}

export const PlayerSchema = SchemaFactory.createForClass(Player);