import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

const DEFAULT_COURSES = [
  {
    title: 'Java Essentials',
    slug: 'java-essentials',
    description: 'Aprende los fundamentos de Java paso a paso.',
  },
  {
    title: 'JavaScript Avanzado',
    slug: 'javascript-avanzado',
    description: 'Domina conceptos clave de JavaScript moderno.',
  },
  {
    title: 'Python para Desarrolladores',
    slug: 'python-para-desarrolladores',
    description: 'Construye bases sólidas en Python y automatización.',
  },
];

const DEFAULT_LESSONS = [
  {
    courseSlug: 'java-essentials',
    title: 'Introducción a Java',
    content: 'Aprende la sintaxis básica de Java.',
    order: 1,
  },
  {
    courseSlug: 'java-essentials',
    title: 'Tipos y variables',
    content: 'Comprende tipos primitivos y variables.',
    order: 2,
  },
  {
    courseSlug: 'javascript-avanzado',
    title: 'Funciones modernas',
    content: 'Arrow functions y callbacks.',
    order: 1,
  },
  {
    courseSlug: 'javascript-avanzado',
    title: 'Asincronía',
    content: 'Promises, async/await y fetch.',
    order: 2,
  },
  {
    courseSlug: 'python-para-desarrolladores',
    title: 'Sintaxis básica',
    content: 'Variables, tipos y operadores.',
    order: 1,
  },
  {
    courseSlug: 'python-para-desarrolladores',
    title: 'Funciones y módulos',
    content: 'Organiza tu código en Python.',
    order: 2,
  },
];

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  private async seedDefaultsIfEmpty() {
    const count = await this.prisma.course.count();
    if (count > 0) {
      return;
    }

    await this.prisma.course.createMany({
      data: DEFAULT_COURSES,
      skipDuplicates: true,
    });

    const courses = await this.prisma.course.findMany({
      where: { slug: { in: DEFAULT_COURSES.map((course) => course.slug) } },
    });

    const lessonData = DEFAULT_LESSONS.map((lesson) => {
      const course = courses.find((courseItem) => courseItem.slug === lesson.courseSlug);
      return course
        ? {
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
            courseId: course.id,
          }
        : null;
    }).filter((item): item is { title: string; content: string; order: number; courseId: number } => item !== null);

    if (lessonData.length > 0) {
      await this.prisma.lesson.createMany({
        data: lessonData,
        skipDuplicates: true,
      });
    }
  }

  async findAll() {
    await this.seedDefaultsIfEmpty();
    return this.prisma.course.findMany({
      include: { lessons: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.course.findUnique({
      where: { slug },
      include: { lessons: true },
    });
  }

  async createLesson(slug: string, data: CreateLessonDto) {
    const course = await this.findBySlug(slug);
    if (!course) {
      throw new NotFoundException(`Curso no encontrado: ${slug}`);
    }

    const order = data.order ?? course.lessons.length + 1;

    return this.prisma.lesson.create({
      data: {
        title: data.title,
        content: data.content,
        order,
        courseId: course.id,
      },
    });
  }
}
