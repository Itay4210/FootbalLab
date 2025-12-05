import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatchDocument = Match & Document;

@Schema()
export class MatchEvent {
  @Prop({ required: true })
  minute: number; // דקה 1-90

  @Prop({ required: true, enum: ['goal', 'yellowCard', 'redCard', 'substitution', 'injury'] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  playerId: Types.ObjectId; // מי ביצע את האירוע

  @Prop()
  description: string; // טקסט חופשי (למשל: "בעיטה נהדרת לחיבורים")
}

@Schema({ timestamps: true })
export class Match {
  @Prop({ type: Types.ObjectId, ref: 'League', required: true })
  leagueId: Types.ObjectId;

  @Prop({ required: true })
  matchday: number; // מחזור מספר X

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  homeTeam: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  awayTeam: Types.ObjectId;

  @Prop({ type: Object, default: { home: 0, away: 0 } })
  score: {
    home: number;
    away: number;
  };

  @Prop({ required: true, enum: ['scheduled', 'finished'], default: 'scheduled' })
  status: string;

  // 📜 רשימת האירועים במשחק (חשוב מאוד לסימולציה)
  @Prop({ type: [SchemaFactory.createForClass(MatchEvent)], default: [] })
  events: MatchEvent[];

  // 📊 סטטיסטיקות משחק (בשביל ה-AI אחר כך)
  @Prop({ type: Object, default: { possession: 50, shots: 0, shotsOnTarget: 0 } })
  stats: {
    possession: number; // אחוז החזקת כדור
    shots: number;
    shotsOnTarget: number;
  };
}

export const MatchSchema = SchemaFactory.createForClass(Match);