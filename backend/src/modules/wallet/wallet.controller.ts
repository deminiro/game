import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthUserEntity } from '@/modules/auth/entities/auth-user.entity';
import { WalletService } from '@/modules/wallet/wallet.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('wallet')
@Controller({ path: '/wallet', version: '1' })
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // @Put('/balance')
  // updateBalance(@Session) {
  //   return this.walletService.createWalletIntent();
  // }

  @Get('/balance')
  @ApiOkResponse({ type: Number })
  getBalanceByUserId(@CurrentUser() user: AuthUserEntity) {
    return this.walletService.getBalanceByUserId(user.id);
  }
}
