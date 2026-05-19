import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✓ Database connected');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('✗ Database connection failed:', errorMessage);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
