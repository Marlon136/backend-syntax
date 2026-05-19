import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getStripe() {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new InternalServerErrorException('Stripe secret key is not configured');
    }
    return new Stripe(secretKey, { apiVersion: '2026-02-25.clover' });
  }

  async createCheckoutSession(origin: string, user: { id: number; email: string }, plan: 'java' | 'python' | 'js') {
    const stripe = this.getStripe();
    // Prefer price IDs (created in Stripe Dashboard) for production
    const priceIdJava = this.configService.get<string>('STRIPE_PRICE_ID_JAVA');
    const priceIdPython = this.configService.get<string>('STRIPE_PRICE_ID_PYTHON');
    const priceIdJs = this.configService.get<string>('STRIPE_PRICE_ID_JS');

    let lineItems: any[];
    if (plan === 'java' && priceIdJava) {
      lineItems = [{ price: priceIdJava, quantity: 1 }];
    } else if (plan === 'python' && priceIdPython) {
      lineItems = [{ price: priceIdPython, quantity: 1 }];
    } else if (plan === 'js' && priceIdJs) {
      lineItems = [{ price: priceIdJs, quantity: 1 }];
    } else {
      // Fallback to dynamic price data (useful for local/test)
      const priceData = plan === 'python'
        ? { currency: 'usd', unit_amount: 4999, product_data: { name: 'Python Pro' } }
        : plan === 'js'
        ? { currency: 'usd', unit_amount: 3999, product_data: { name: 'JavaScript Pro' } }
        : { currency: 'usd', unit_amount: 5999, product_data: { name: 'Java Pro' } };

      lineItems = [{ price_data: priceData, quantity: 1 }];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: user.email,
      metadata: { userId: String(user.id), plan },
      success_url: `${origin}/subscribe?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe?canceled=1`,
    });

    return session;
  }

  async markUserAsPro(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isPro: true },
    });
  }
}
