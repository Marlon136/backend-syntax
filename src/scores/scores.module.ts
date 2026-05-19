import { Module } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { ScoresController } from './scores.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ScoresService],
  controllers: [ScoresController],
  exports: [ScoresService],
})
export class ScoresModule {}
