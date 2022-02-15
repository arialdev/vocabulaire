import {CategoryFilter} from './category-filter';

export interface TagOptions {
  id: number;
  searchText: string;
  gramaticalCategoriesOptions: Array<CategoryFilter>;
  status: boolean;
  createdAt: number;
  updatedAt: number;
}
