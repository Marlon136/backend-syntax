import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async addFriend(userId: number, friendId: number) {
    // Ensure both users exist
    const [user, friend] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: friendId } }),
    ]);
    if (!user || !friend) throw new NotFoundException('User or friend not found');

    return this.prisma.friendship.create({ data: { userId, friendId, status: 'accepted' } });
  }

  async getFriendsLeaderboard(userId: number) {
    // Retrieve all users for a global leaderboard
    const users = await this.prisma.user.findMany({ select: { id: true, name: true, email: true } });
    const userIds = users.map((u) => u.id);

    // Aggregate total points for all users using userScore groupBy
    const totals = await this.prisma.userScore.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _sum: { points: true },
    });

    // Map totals by userId
    const totalsMap = new Map<number, number>();
    totals.forEach((t) => totalsMap.set(t.userId, t._sum?.points ?? 0));

    // Fetch per-course scores for all users
    const perCourseScores = await this.prisma.userScore.findMany({ where: { userId: { in: userIds } }, select: { userId: true, courseId: true, points: true } });

    const perCourseMap = new Map<number, { courseId: number; points: number }[]>();
    perCourseScores.forEach((s) => {
      if (!perCourseMap.has(s.userId)) perCourseMap.set(s.userId, []);
      perCourseMap.get(s.userId)!.push({ courseId: s.courseId ?? 0, points: s.points });
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      totalPoints: totalsMap.get(u.id) ?? 0,
      perCourse: perCourseMap.get(u.id) ?? [],
    }));

    return result.sort((a, b) => b.totalPoints - a.totalPoints);
  }
}
