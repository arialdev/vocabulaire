import {CategoryType} from '../../enums/enums';
import {StoringItem} from '../storing-item';

export class Category extends StoringItem {
  private name: string;
  private type: CategoryType;

  constructor(categoryData);
  constructor(name: string, type: CategoryType);
  constructor(data: string | any, type?: CategoryType) {
    if (typeof data === 'string') {
      super();
      this.name = data;
      this.type = type;
    } else {
      super(data.id, data.status, data.createdAt, data.updatedAt);
      this.name = data.name;
      this.type = data.type;
    }
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
