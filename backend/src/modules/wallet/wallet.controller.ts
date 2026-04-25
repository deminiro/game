import { WalletService } from '@/modules/wallet/wallet.service';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('wallet')
@Controller({ path: '/wallet', version: '1' })
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // @Put('/balance')
  // updateBalance(@Session) {
  //   return this.walletService.createWalletIntent();
  // }

  @Get('/:id')
  @ApiOkResponse({ type: Number })
  getBalanceByUserId(@Param('id') id: string) {
    return this.walletService.getBalanceByUserId(id);
  }
}
