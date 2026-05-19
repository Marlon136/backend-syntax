import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCourseId(courseId: number) {
    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.lesson.findUnique({
      where: { id },
    });
  }
}
