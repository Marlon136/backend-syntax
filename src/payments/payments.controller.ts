import { Body, Controller, Headers, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-session')
  async createCheckoutSession(
    @Req() req: Request & { user?: { userId: number; email: string } },
    @Body() body: { plan?: string },
    @Headers('origin') originHeader: string,
  ) {
    const origin = originHeader || this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const plan = body.plan === 'python' ? 'python' : body.plan === 'js' ? 'js' : 'java';

    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const session = await this.paymentsService.createCheckoutSession(origin, {
      id: user.id,
      email: user.email,
    }, plan);

    return { url: session.url };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }

    const rawBody = req.body as Buffer;
    const stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2026-02-25.clover',
    });

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ? Number(session.metadata.userId) : undefined;
      if (userId) {
        await this.paymentsService.markUserAsPro(userId);
      }
    }

    return { received: true };
  }
}
