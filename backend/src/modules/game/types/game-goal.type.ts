import { GameStorageItem } from '@prisma/client';

export type GameGoal = { amount: number; item: GameStorageItem };
