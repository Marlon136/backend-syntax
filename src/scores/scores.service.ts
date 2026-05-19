import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Injectable()
export class ScoresService {
  constructor(private readonly prisma: PrismaService) {}

  async addPoints(dto: CreateScoreDto) {
    const { userId, courseId, points } = dto;
    if (!userId || !courseId) {
      throw new BadRequestException('userId and courseId are required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const existing = await this.prisma.userScore.findFirst({ where: { userId, courseId } });
    if (existing) {
      return this.prisma.userScore.update({ where: { id: existing.id }, data: { points: existing.points + points } });
    }

    return this.prisma.userScore.create({ data: { userId, courseId, points } });
  }
}
