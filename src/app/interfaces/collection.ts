import {Language} from './language';
import {Term} from './term';
import {Category} from './category';
import {Tag} from './tag';

export interface Collection {
  id: number;
  originalLanguage: Language;
  destinyLanguage: Language;
  active: boolean;
  terms: Array<Term>;
  gramaticalCategories: Array<Category>;
  thematicCategories: Array<Category>;
  tags: Array<Tag>;
  createdAt: number;
  updatedAt: number;
}
