import {Collection} from './collection';
import {Category} from './category';


export interface Term {
  id: number;
  collection: Collection;
  originalTerm: string;
  translatedTerm: string;
  notes: string;
  gramaticalCategories: Array<Category>;
  thematicCategories: Array<Category>;
  status: boolean;
  updatedAt: number;
  createdAt: number;
}
