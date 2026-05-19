import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('scores')
export class ScoresController {
  constructor(private readonly service: ScoresService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  add(@Req() req: any, @Body() dto: CreateScoreDto) {
    const userId = req.user?.userId ?? req.user?.sub ?? null;
    return this.service.addPoints({ ...dto, userId });
  }
}
