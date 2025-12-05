import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true }) // מוסיף אוטומטית תאריך יצירה ועדכון
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  logoUrl: string;

  @Prop({ required: true })
  stadium: string;

  // 🔗 קשר לליגה (נבנה את זה בהמשך)
  @Prop({ type: Types.ObjectId, ref: 'League', required: false }) 
  leagueId: Types.ObjectId;

  // ⚔️ נתונים למנוע הסימולציה
  @Prop({ default: 5, min: 1, max: 10 })
  attackStrength: number;

  @Prop({ default: 5, min: 1, max: 10 })
  defenseStrength: number;

  @Prop({ default: 50, min: 0, max: 100 })
  morale: number; // 0-100 (משתנה אחרי ניצחונות/הפסדים)

  // 📊 טבלה פנימית (Snapshot) לעונה הנוכחית
  @Prop({
    type: Object,
    default: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }
  })
  seasonStats: {
    points: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  };
}

export const TeamSchema = SchemaFactory.createForClass(Team);