import {CategoryType} from '../categoryType/category-type';
import {StoringItem} from '../storing-item';

export class Category extends StoringItem {
  private name: string;
  private type: CategoryType;

  constructor(name: string, type: CategoryType) {
    super();
    this.name = name;
    this.type = type;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    this.updateUpdatedTime();
  }

  public getType(): CategoryType {
    return this.type;
  }

  public setType(type: CategoryType) {
    this.type = type;
    this.updateUpdatedTime();
  }
}
