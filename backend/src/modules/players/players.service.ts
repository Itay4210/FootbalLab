import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from './schemas/player.schema';
import { Team, TeamDocument } from '../teams/schemas/team.schema';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>, // 👈 הזרקנו גם את מודל הקבוצות!
  ) {}

  async findAll() {
    return this.playerModel.find().populate('teamId', 'name').exec(); // populate מביא את שם הקבוצה במקום רק ID
  }

  // 🌱 ה-Seed החכם
   // 🌱 ה-Seed החכם והמוקפד (ללא any)
  // 🌱 Seed סופר-מפורט: 25 שחקנים לקבוצה בעמדות מדויקות
  async seed() {
    const playerCount = await this.playerModel.countDocuments();
    if (playerCount > 0) return { message: 'Players already exist' };

    const teams = await this.teamModel.find().exec();
    if (teams.length === 0) return { message: 'No teams found!' };

    const playersToInsert: Partial<Player>[] = [];

    // הגדרת הרכב סגל מאוזן (סה"כ 25 שחקנים)
    const SQUAD_DISTRIBUTION = [
      { pos: 'GK', count: 3 },  // 3 שוערים
      { pos: 'CB', count: 4 },  // 4 בלמים
      { pos: 'LB', count: 2 },  // 2 מגנים שמאליים
      { pos: 'RB', count: 2 },  // 2 מגנים ימניים
      { pos: 'CDM', count: 2 }, // 2 קשרים אחוריים
      { pos: 'CM', count: 4 },  // 4 קשרי אמצע
      { pos: 'CAM', count: 2 }, // 2 קשרים התקפיים
      { pos: 'LW', count: 2 },  // 2 קיצוני שמאל
      { pos: 'RW', count: 2 },  // 2 קיצוני ימין
      { pos: 'ST', count: 2 },  // 2 חלוצים
    ];

    console.log('Starting massive player seed...'); // לוג כדי שנדע שזה עובד

    for (const team of teams) {
      
      for (const role of SQUAD_DISTRIBUTION) {
        for (let i = 1; i <= role.count; i++) {
          
          // חישוב שווי שוק גס לפי עמדה (חלוצים שווים יותר בדר"כ)
          let baseValue = 1000000;
          if (role.pos === 'ST' || role.pos === 'CAM') baseValue = 3000000;
          if (role.pos === 'GK') baseValue = 500000;

          // רנדומליות לגיל (18-36)
          const age = Math.floor(Math.random() * 18) + 18;

          playersToInsert.push({
            name: `${team.name} ${role.pos} ${i}`, // למשל: Real Madrid CB 1
            age: age,
            position: role.pos,
            nationality: team.country,
            teamId: team._id,
            marketValue: baseValue * (Math.random() + 0.5), // קצת רנדומליות במחיר
            seasonStats: {
               goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 
            }
          });
        }
      }
    }

    // בגלל שיש 2500 שחקנים, נכניס אותם במכה אחת
    await this.playerModel.insertMany(playersToInsert);
    
    return { 
      message: `Seed Complete! Created ${playersToInsert.length} players. Each team has 25 balanced players.` 
    };
  }
}