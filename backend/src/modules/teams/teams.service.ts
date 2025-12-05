import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { League, LeagueDocument } from '../leagues/schemas/league.schema'; // וודא שהייבוא נכון

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>, // הוספנו את הליגות
  ) {}

  async findAll() {
    return this.teamModel.find().populate('leagueId').exec();
  }

  // 🌱 Seed משודרג: 20 קבוצות לכל ליגה
  async seed() {
    const count = await this.teamModel.countDocuments();
    if (count > 0) return { message: 'Teams already exist' };

    const leagues = await this.leagueModel.find().exec();
    if (leagues.length === 0) return { message: 'Run Leagues Seed first!' };

    const teamsToInsert: Partial<Team>[] = [];

    // מאגר שמות אמיתיים לחלק מהקבוצות (בשביל הכיף)
    const realTeams = {
      'England': ['Man City', 'Arsenal', 'Liverpool', 'Man Utd', 'Chelsea', 'Spurs', 'Newcastle', 'Aston Villa'],
      'Spain': ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia', 'Real Sociedad', 'Betis'],
      'Germany': ['Bayern Munich', 'Dortmund', 'Leipzig', 'Leverkusen', 'Wolfsburg', 'Frankfurt'],
      'Italy': ['Napoli', 'Inter', 'Milan', 'Juventus', 'Roma', 'Lazio', 'Atalanta'],
      'France': ['PSG', 'Marseille', 'Lyon', 'Monaco', 'Lille', 'Nice']
    };

    for (const league of leagues) {
      // 1. ניצור רשימה של 20 שמות לקבוצות בליגה הזו
      const leagueTeamNames = [...(realTeams[league.country] || [])];
      
      // השלמה ל-20 קבוצות עם שמות גנריים
      for (let i = leagueTeamNames.length + 1; i <= 20; i++) {
        leagueTeamNames.push(`${league.country} Club ${i}`); // למשל: England Club 9
      }

      // 2. יצירת אובייקט הקבוצה
      for (const teamName of leagueTeamNames) {
        // רנדומיזציה קלה לכוח כדי שלא כולן יהיו שוות
        const baseStr = Math.floor(Math.random() * 5) + 5; // 5-9

        teamsToInsert.push({
          name: teamName,
          country: league.country,
          stadium: `${teamName} Stadium`,
          leagueId: league._id,
          attackStrength: baseStr, 
          defenseStrength: baseStr,
          morale: 80,
        });
      }
    }

    await this.teamModel.insertMany(teamsToInsert);
    return { message: `Created ${teamsToInsert.length} teams across ${leagues.length} leagues.` };
  }
}