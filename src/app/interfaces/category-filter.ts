import {Category} from '../classes/category/category';

export interface CategoryFilter {
  id: number;
  category: Category;
  code: number;
  status: boolean;
  createdAt: number;
  updatedAt: number;
}
