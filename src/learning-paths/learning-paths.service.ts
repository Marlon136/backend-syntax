import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';

@Injectable()
export class LearningPathsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const prisma = this.prisma as any;
    return prisma.learningPath.findMany({ include: { pathCourses: { include: { course: { include: { lessons: true } } } } } });
  }

  async findBySlug(slug: string) {
    const prisma = this.prisma as any;
    const path = await prisma.learningPath.findUnique({ where: { slug }, include: { pathCourses: { include: { course: { include: { lessons: true } } } } } });
    if (!path) throw new NotFoundException(`LearningPath not found: ${slug}`);
    return path;
  }

  async create(data: CreateLearningPathDto) {
    const prisma = this.prisma as any;
    return prisma.learningPath.create({ data });
  }

  async addCourse(slug: string, courseId: number, order?: number) {
    const prisma = this.prisma as any;
    const path = await prisma.learningPath.findUnique({ where: { slug }, include: { pathCourses: true } });
    if (!path) throw new NotFoundException(`LearningPath not found: ${slug}`);

    const nextOrder = order ?? (path.pathCourses.length + 1);

    return prisma.pathCourse.create({ data: { learningPathId: path.id, courseId, order: nextOrder } });
  }

  async getLeaderboardForPath(slug: string, userId: number) {
    const prisma = this.prisma as any;
    const path = await prisma.learningPath.findUnique({ where: { slug }, include: { pathCourses: true } });
    if (!path) throw new NotFoundException(`LearningPath not found: ${slug}`);

    const courseIds = path.pathCourses.map((pc: { courseId: number }) => pc.courseId);

    // Get friends of user (both directions)
    // Only include accepted friendships
    const sent = await prisma.friendship.findMany({ where: { userId, status: 'accepted' }, select: { friendId: true } });
    const received = await prisma.friendship.findMany({ where: { friendId: userId, status: 'accepted' }, select: { userId: true } });
    const friendIds = Array.from(new Set([
      ...sent.map((s: { friendId: number }) => s.friendId),
      ...received.map((r: { userId: number }) => r.userId),
      userId,
    ]));

    if (courseIds.length === 0) {
      return [];
    }

    // Sum points per user for courses in this path
    const totals = await prisma.userScore.groupBy({
      by: ['userId'],
      where: { userId: { in: friendIds }, courseId: { in: courseIds } },
      _sum: { points: true },
    });

    const totalsMap = new Map<number, number>();
    totals.forEach((t: { userId: number; _sum?: { points?: number | null } }) => totalsMap.set(t.userId, t._sum?.points ?? 0));

    const users = await prisma.user.findMany({ where: { id: { in: friendIds } }, select: { id: true, name: true, email: true } });

    // per-course breakdown limited to courses in the path
    const perCourseScores = await prisma.userScore.findMany({ where: { userId: { in: friendIds }, courseId: { in: courseIds } }, select: { userId: true, courseId: true, points: true } });

    const perCourseMap = new Map<number, { courseId: number; points: number }[]>();
    perCourseScores.forEach((s: { userId: number; courseId: number | null; points: number }) => {
      if (!perCourseMap.has(s.userId)) perCourseMap.set(s.userId, []);
      perCourseMap.get(s.userId)!.push({ courseId: s.courseId ?? 0, points: s.points });
    });

    const result = users.map((u: { id: number; name: string | null; email: string }) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      totalPoints: totalsMap.get(u.id) ?? 0,
      perCourse: perCourseMap.get(u.id) ?? [],
    }));

    return result.sort((a: { totalPoints: number }, b: { totalPoints: number }) => b.totalPoints - a.totalPoints);
  }
}
