export class GameDice {
  private value: number = 0;

  constructor() {
    this.roll();
  }

  getValue(): number {
    return this.value;
  }

  roll(): number {
    this.value = Math.random();

    return this.getValue();
  }

  isFailed(): boolean {
    return this.value < 0.3;
  }
}
