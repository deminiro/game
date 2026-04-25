import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  createPaymentIntent(): never {
    throw new NotImplementedException(
      'PaymentsService.createPaymentIntent not implemented',
    );
  }

  confirmPayment(): never {
    throw new NotImplementedException(
      'PaymentsService.confirmPayment not implemented',
    );
  }

  refundPayment(): never {
    throw new NotImplementedException(
      'PaymentsService.refundPayment not implemented',
    );
  }
}
