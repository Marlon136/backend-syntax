import { Body, Controller, ForbiddenException, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getCourses() {
    return this.coursesService.findAll();
  }

  @Get(':slug')
  async getCourse(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/lessons')
  async createLesson(
    @Param('slug') slug: string,
    @Request() req: { user: { email: string } },
    @Body() body: CreateLessonDto,
  ) {
    if (req.user.email.toLowerCase() !== 'marlon@gmail.com') {
      throw new ForbiddenException('Acceso denegado');
    }
    return this.coursesService.createLesson(slug, body);
  }
}
