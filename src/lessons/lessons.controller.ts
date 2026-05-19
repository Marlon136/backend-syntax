import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('course/:courseId')
  async getCourseLessons(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.lessonsService.findByCourseId(courseId);
  }

  @Get(':id')
  async getLesson(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.findOne(id);
  }
}
