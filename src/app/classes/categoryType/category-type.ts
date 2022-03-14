import {StoringItem} from '../storing-item';

export class CategoryType extends StoringItem {
  private name: string;

  constructor(name: string);
  constructor(categoryTypeData: any);
  constructor(data: string | any) {
    if (typeof data === 'string') {
      super();
      this.name = data;
    } else {
      super(data.id, data.status, data.createdAt, data.updatedAt);
      this.name = data.name;
    }
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    this.updateUpdatedTime();
  }
}
