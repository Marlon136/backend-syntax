import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.course.createMany({
    data: [
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
    ],
    skipDuplicates: true,
  });

  const javaCourse = await prisma.course.findUnique({ where: { slug: 'java-essentials' } });
  const jsCourse = await prisma.course.findUnique({ where: { slug: 'javascript-avanzado' } });
  const pythonCourse = await prisma.course.findUnique({ where: { slug: 'python-para-desarrolladores' } });

  if (javaCourse) {
    await prisma.lesson.createMany({
      data: [
        {
          title: 'Introducción a Java',
          content: 'Comprende cómo funciona un programa Java, la estructura de clases y el método main. Este enunciado te prepara para escribir tu primer programa.',
          order: 1,
          courseId: javaCourse.id,
        },
        {
          title: 'Tipos y variables',
          content: 'Aprende los tipos primitivos, cómo declarar variables y cómo imprimir valores en consola. Usa ejemplos claros de int, String y boolean.',
          order: 2,
          courseId: javaCourse.id,
        },
      ],
    });
  }

  if (jsCourse) {
    await prisma.lesson.createMany({
      data: [
        {
          title: 'Funciones modernas',
          content: 'Construye funciones modernas usando arrow syntax y aprende cómo pasar datos con callbacks. El ejercicio es crear funciones que transformen valores.',
          order: 1,
          courseId: jsCourse.id,
        },
        {
          title: 'Asincronía',
          content: 'Gestiona código asíncrono con Promises y async/await, y aprende a llamar una API simulada. El enunciado te pide escribir una función que espere una respuesta.',
          order: 2,
          courseId: jsCourse.id,
        },
      ],
    });
  }

  if (pythonCourse) {
    await prisma.lesson.createMany({
      data: [
        {
          title: 'Sintaxis básica',
          content: 'Entiende variables, operadores y estructuras simples en Python. El enunciado explica cómo escribir tu primer script.',
          order: 1,
          courseId: pythonCourse.id,
        },
        {
          title: 'Funciones y módulos',
          content: 'Organiza tu código en funciones y usa módulos para separarlo. El ejercicio propone crear funciones reutilizables.',
          order: 2,
          courseId: pythonCourse.id,
        },
      ],
    });
  }
}

async function seedAdditional() {
  // Create some users
  await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', password: 'pass1', name: 'Alice' },
      { email: 'bob@example.com', password: 'pass2', name: 'Bob' },
      { email: 'carol@example.com', password: 'pass3', name: 'Carol' },
    ],
    skipDuplicates: true,
  });

  const alice = await prisma.user.findUnique({ where: { email: 'alice@example.com' } });
  const bob = await prisma.user.findUnique({ where: { email: 'bob@example.com' } });
  const carol = await prisma.user.findUnique({ where: { email: 'carol@example.com' } });

  // Friendships
  if (alice && bob) {
    await prisma.friendship.createMany({ data: [{ userId: alice.id, friendId: bob.id }, { userId: bob.id, friendId: alice.id }], skipDuplicates: true });
  }
  if (alice && carol) {
    await prisma.friendship.createMany({ data: [{ userId: alice.id, friendId: carol.id }, { userId: carol.id, friendId: alice.id }], skipDuplicates: true });
  }

  // Learning paths
  await prisma.learningPath.createMany({ data: [
    { title: 'Iniciación Java', slug: 'path-java', description: 'Path para iniciarse en Java' },
    { title: 'Inicio JavaScript', slug: 'path-js', description: 'Path para JavaScript' },
  ], skipDuplicates: true });

  const pathJava = await prisma.learningPath.findUnique({ where: { slug: 'path-java' } });
  const pathJs = await prisma.learningPath.findUnique({ where: { slug: 'path-js' } });

  const javaCourse = await prisma.course.findUnique({ where: { slug: 'java-essentials' } });
  const jsCourse = await prisma.course.findUnique({ where: { slug: 'javascript-avanzado' } });

  if (pathJava && javaCourse) {
    await prisma.pathCourse.createMany({ data: [{ learningPathId: pathJava.id, courseId: javaCourse.id, order: 1 }], skipDuplicates: true });
  }
  if (pathJs && jsCourse) {
    await prisma.pathCourse.createMany({ data: [{ learningPathId: pathJs.id, courseId: jsCourse.id, order: 1 }], skipDuplicates: true });
  }

  // User scores
  if (alice && javaCourse) {
    await prisma.userScore.createMany({ data: [{ userId: alice.id, courseId: javaCourse.id, points: 150 }, { userId: bob?.id ?? 0, courseId: javaCourse.id, points: 100 }].filter((d) => d.userId > 0), skipDuplicates: true });
  }
  if (bob && jsCourse) {
    await prisma.userScore.createMany({ data: [{ userId: bob.id, courseId: jsCourse.id, points: 200 }, { userId: carol?.id ?? 0, courseId: jsCourse.id, points: 50 }].filter((d) => d.userId > 0), skipDuplicates: true });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Seed additional data
    try {
      await seedAdditional();
    } catch (e) {
      console.error('seedAdditional error', e);
    }
    await prisma.$disconnect();
  });
