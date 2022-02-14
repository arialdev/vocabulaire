import {CategoryType} from './category-type';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  updatedAt: number;
  createdAt: number;
}
