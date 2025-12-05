import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './schemas/match.schema';
import { Team, TeamDocument } from '../teams/schemas/team.schema';
import { League, LeagueDocument } from '../leagues/schemas/league.schema';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
  ) {}

  async findAll() {
    return this.matchModel.find().exec();
  }

  // 🔥 יצירת לוח משחקים מלא לכל העונה
  async seed() {
    // בדיקה אם כבר יש משחקים
    const count = await this.matchModel.countDocuments();
    if (count > 0) return { message: 'Matches already exist!' };

    const leagues = await this.leagueModel.find().exec();
    const allMatchesToInsert: Partial<Match>[] = [];

    for (const league of leagues) {
      // 1. נביא את כל הקבוצות של הליגה הזו
      const teams = await this.teamModel.find({ leagueId: league._id }).exec();
      
      if (teams.length < 2) continue; // אי אפשר ליצור ליגה עם קבוצה אחת

      // 2. הפעלת אלגוריתם Round Robin
      const fixtures = this.generateRoundRobin(teams, league._id);
      allMatchesToInsert.push(...fixtures);
    }

    // 3. שמירה מרוכזת (Bulk Insert)
    await this.matchModel.insertMany(allMatchesToInsert);
    
    return { 
      message: `Fixtures generated! Created ${allMatchesToInsert.length} matches across ${leagues.length} leagues.` 
    };
  }

  // 🧠 האלגוריתם המתמטי לסידור ליגה
  private generateRoundRobin(teams: TeamDocument[], leagueId: any): Partial<Match>[] {
    const matches: Partial<Match>[] = [];
    const numTeams = teams.length;
    const numRounds = (numTeams - 1) * 2; // בית וחוץ
    const matchesPerRound = numTeams / 2;

    // יוצרים מערך IDs לסיבוב
    let rotation = teams.map(t => t._id);

    for (let round = 0; round < numRounds; round++) {
      const isSecondHalf = round >= (numTeams - 1); // סיבוב שני (משחקי הגומלין)

      for (let i = 0; i < matchesPerRound; i++) {
        const home = rotation[i];
        const away = rotation[numTeams - 1 - i];

        // בסיבוב השני הופכים בית/חוץ
        matches.push({
          leagueId: leagueId,
          matchday: round + 1,
          homeTeam: isSecondHalf ? away : home,
          awayTeam: isSecondHalf ? home : away,
          score: { home: 0, away: 0 },
          status: 'scheduled',
          events: [],
          stats: { possession: 50, shots: 0, shotsOnTarget: 0 }
        });
      }

      // 🔄 רוטציה של הקבוצות למחזור הבא
      // משאירים את האינדקס הראשון קבוע, ומסובבים את השאר
      // [0, 1, 2, 3] -> [0, 3, 1, 2]
      const fixedTeam = rotation[0];
      const rest = rotation.slice(1);
      rest.unshift(rest.pop()!); // מעבירים את האחרון להתחלה
      rotation = [fixedTeam, ...rest];
    }

    return matches;
  }
}