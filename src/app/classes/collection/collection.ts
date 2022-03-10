import {Category} from '../../interfaces/category';
import {Tag} from '../../interfaces/tag';
import {Term} from '../term/term';
import {Language} from '../language/language';

export class Collection {
  active: boolean;
  createdAt: number;
  gramaticalCategories: Array<Category>;
  id: number;
  language: Language;
  status: boolean;
  tags: Array<Tag>;
  terms: Array<Term>;
  thematicCategories: Array<Category>;
  updatedAt: number;

  constructor(languageName: string, languagePrefix: string, languageIcon: string) {
    this.status = true;
    this.language = new Language(languageName, languagePrefix, languageIcon);
    this.terms = [];
    this.tags = [];
    this.gramaticalCategories = [];
    this.thematicCategories = [];
    this.active = false;
    this.createdAt = new Date().getTime();
    this.updatedAt = new Date().getTime();
  }
}
