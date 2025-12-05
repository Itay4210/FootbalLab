import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './schemas/match.schema';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { TeamsModule } from '../teams/teams.module';     // 👈 ייבוא הקבוצות
import { LeaguesModule } from '../leagues/leagues.module'; // 👈 ייבוא הליגות

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    TeamsModule,   // כדי לשלוף קבוצות
    LeaguesModule, // כדי לשלוף ליגות
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}