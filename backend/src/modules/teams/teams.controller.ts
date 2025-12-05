import { Controller, Get, Post } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams') // הכתובת תהיה http://localhost:3000/teams
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  getAllTeams() {
    return this.teamsService.findAll();
  }

  @Post('seed') // הכתובת להפעלת הנתונים: http://localhost:3000/teams/seed
  seedData() {
    return this.teamsService.seed();
  }
}