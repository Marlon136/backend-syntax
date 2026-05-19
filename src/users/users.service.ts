import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateById(id: number, data: Partial<CreateUserDto & { avatarUrl?: string }>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getCompletedCourseSlugs(userId: number) {
    const scores = await this.prisma.userScore.findMany({ where: { userId }, include: { course: { select: { slug: true } } } });
    return scores.map((s) => s.course?.slug).filter(Boolean) as string[];
  }
}
