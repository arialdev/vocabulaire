import {StoringItem} from '../storing-item';
import {CategoryFilter} from '../categoryFilter/category-filter';
import {Category} from '../category/category';

export enum CategorySelection {
  selected = 1,
  nonSelected = -1,
  all = 0,
}

export class TagOptions extends StoringItem {
  private searchText: string;
  private gramaticalCategoriesOptions: CategoryFilter[];
  private thematicCategoriesOptions: CategoryFilter[];


  constructor(searchText: string) {
    super();
    this.searchText = searchText;
    this.gramaticalCategoriesOptions = [];
    this.thematicCategoriesOptions = [];
  }

  public getSearchText(): string {
    return this.searchText;
  }

  public setSearchText(text: string): void {
    this.searchText = text;
    this.updateUpdatedTime();
  }

  public getGramaticalCategories(filter: CategorySelection = CategorySelection.all): Category[] {
    let result: CategoryFilter[];
    if (filter === 1) {
      result = this.gramaticalCategoriesOptions.filter(co => co.isSelected());
    } else if (filter === -1) {
      result = this.gramaticalCategoriesOptions.filter(co => !co.isSelected());
    } else {
      result = this.gramaticalCategoriesOptions;
    }
    return result.map(co => co.getCategory());
  }

  public addGramaticalCategory(category: Category, selected: boolean): void {
    const foundCategoryIndex = this.gramaticalCategoriesOptions.findIndex(co => co.getCategory().getId() === category.getId());
    if (foundCategoryIndex !== -1) {
      this.gramaticalCategoriesOptions[foundCategoryIndex].select(selected);
    } else {
      this.gramaticalCategoriesOptions.push(new CategoryFilter(category, selected));
    }
    this.updateUpdatedTime();
  }

  public removeGramaticalCategory(categoryId: number) {
    this.gramaticalCategoriesOptions = this.gramaticalCategoriesOptions.filter(co => co.getCategory().getId() !== categoryId);
    this.updateUpdatedTime();
  }

  public getThematicCategories(filter: CategorySelection = CategorySelection.all): Category[] {
    let result: CategoryFilter[];
    if (filter === 1) {
      result = this.thematicCategoriesOptions.filter(co => co.isSelected());
    } else if (filter === -1) {
      result = this.thematicCategoriesOptions.filter(co => !co.isSelected());
    } else {
      result = this.thematicCategoriesOptions;
    }
    return result.map(co => co.getCategory());
  }

  public addThematicCategory(category: Category, selected: boolean): void {
    const foundCategoryIndex = this.thematicCategoriesOptions.findIndex(co => co.getCategory().getId() === category.getId());
    if (foundCategoryIndex !== -1) {
      this.thematicCategoriesOptions[foundCategoryIndex].select(selected);
    } else {
      this.thematicCategoriesOptions.push(new CategoryFilter(category, selected));
    }
    this.updateUpdatedTime();
  }

  public removeThematicCategory(categoryId: number) {
    this.thematicCategoriesOptions = this.thematicCategoriesOptions.filter(co => co.getCategory().getId() !== categoryId);
    this.updateUpdatedTime();
  }
}
