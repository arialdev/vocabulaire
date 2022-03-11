import {StoringItem} from '../storing-item';

export class CategoryType extends StoringItem {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    this.updateUpdatedTime();
  }
}
