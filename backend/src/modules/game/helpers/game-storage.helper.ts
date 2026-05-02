import { GameStorageItem } from '@prisma/client';
import { GameUserStorageEntity } from '../entities/game-user-storage.enitiy';

export class GameStorage {
  private items: GameStorageItem[];
  private limit: number;

  constructor(storage: GameUserStorageEntity) {
    this.items = [...storage.items];
    this.limit = storage.limit;
  }

  addNew(item: GameStorageItem): GameStorageItem[] {
    if (this.items.length === this.limit) this.removeByLimit();

    this.items.push(item);

    return this.items;
  }

  private removeByLimit(): void {
    this.items.shift();
  }
}
