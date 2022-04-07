import {StoringItem} from '../storing-item';
import {Category} from '../category/category';

export class CategoryFilter extends StoringItem {
  private category: Category;
  private selected: boolean;

  constructor(categoryFilterData);
  constructor(category: Category, selected: boolean);
  constructor(data: Category | any, selected?: boolean) {
    if (data instanceof Category) {
      super();
      this.category = data;
      this.selected = selected;
    } else {
      super(data.id, data.status, data.createdAt, data.updatedAt);
      this.category = new Category(data.category);
      this.selected = data.selected;
    }
  }

  public getCategory(): Category {
    return this.category;
  }

  public setCategory(category: Category): void {
    this.category = category;
    this.updateUpdatedTime();
  }

  public isSelected(): boolean {
    return this.selected;
  }

  public select(status: boolean) {
    this.selected = status;
    this.updateUpdatedTime();
  }
}
