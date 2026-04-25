import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from '@/modules/payments/payments.service';

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intents')
  createPaymentIntent() {
    return this.paymentsService.createPaymentIntent();
  }

  @Post('confirm')
  confirmPayment() {
    return this.paymentsService.confirmPayment();
  }

  @Post('refund')
  refundPayment() {
    return this.paymentsService.refundPayment();
  }
}
