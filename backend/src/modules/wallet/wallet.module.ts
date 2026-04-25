import { WalletController } from '@/modules/wallet/wallet.controller';
import { WalletService } from '@/modules/wallet/wallet.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
