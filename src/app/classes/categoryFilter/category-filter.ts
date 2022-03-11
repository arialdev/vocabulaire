import {StoringItem} from '../storing-item';
import {Category} from '../category/category';

export class CategoryFilter extends StoringItem {
  private category: Category;
  private selected: boolean;

  constructor(category: Category, selected: boolean);
  constructor(category: Category, selected: boolean) {
    super();
    this.category = category;
    this.selected = selected;
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
