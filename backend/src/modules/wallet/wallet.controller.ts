import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthUserEntity } from '@/modules/auth/entities/auth-user.entity';
import { WalletService } from '@/modules/wallet/wallet.service';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateWalletBalanceDto } from './dto/update-balance.dto';

@ApiTags('wallet')
@Controller({ path: '/wallet', version: '1' })
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Put('/balance')
  @ApiOkResponse({ type: Number })
  updateBalance(@CurrentUser() user: AuthUserEntity, @Body() dto: UpdateWalletBalanceDto) {
    return this.walletService.updateBalance(user.id, dto);
  }

  @Get('/balance')
  @ApiOkResponse({ type: Number })
  getBalanceByUserId(@CurrentUser() user: AuthUserEntity) {
    return this.walletService.getBalanceByUserId(user.id);
  }
}
