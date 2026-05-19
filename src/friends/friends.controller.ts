import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class FriendsController {
  constructor(private readonly service: FriendsService) {}

  @Post('friends')
  addFriend(@Body() dto: CreateFriendDto) {
    return this.service.addFriend(dto.userId, dto.friendId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  leaderboard(@Request() req: any) {
    const userId = req.user?.userId;
    return this.service.getFriendsLeaderboard(Number(userId));
  }
}
