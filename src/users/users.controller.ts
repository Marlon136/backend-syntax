import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: { user: { userId: number } }) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Request() req: { user: { userId: number } },
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.updateById(req.user.userId, body as any);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/completed-courses')
  async getCompletedCourses(@Request() req: { user: { userId: number } }) {
    return this.usersService.getCompletedCourseSlugs(req.user.userId);
  }
}
