import { BalanceOperation } from './enums/balance-operations';

export const balanceOperations = {
  [BalanceOperation.ADD]: (current: number, upcoming: number) => current + upcoming,
  [BalanceOperation.REMOVE]: (current: number, upcoming: number) => current - upcoming,
};
