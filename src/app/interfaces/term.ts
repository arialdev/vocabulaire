import {Collection} from './collection';
import {Category} from './category';


export interface Term {
  id: number;
  collection: Collection;
  from: string;
  to: string;
  notes: string;
  gramaticalCategories: Array<Category>;
  thematicCategories: Array<Category>;
  updatedAt: number;
  createdAt: number;
}
