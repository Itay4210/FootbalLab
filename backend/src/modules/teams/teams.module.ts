import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from './schemas/team.schema';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { LeaguesModule } from '../leagues/leagues.module'; // 👈 1. ייבוא

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    LeaguesModule, // 👈 2. הוספה לרשימת הייבוא
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [MongooseModule], 
})
export class TeamsModule {}