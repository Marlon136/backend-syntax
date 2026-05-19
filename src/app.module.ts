import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { PaymentsModule } from './payments/payments.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { FriendsModule } from './friends/friends.module';
import { ScoresModule } from './scores/scores.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    PaymentsModule,
    // New modules
    LearningPathsModule,
    FriendsModule,
    ScoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
