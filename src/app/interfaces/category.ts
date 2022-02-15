import {CategoryType} from './category-type';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  status: boolean;
  updatedAt: number;
  createdAt: number;
}
