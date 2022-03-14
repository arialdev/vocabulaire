import {Category} from '../category/category';
import {Tag} from '../tag/tag';
import {Term} from '../term/term';
import {Language} from '../language/language';
import {StoringItem} from '../storing-item';

export class Collection extends StoringItem {
  private language: Language;
  private terms: Term[];
  private gramaticalCategories: Array<Category>;
  private thematicCategories: Array<Category>;
  private active: boolean;
  private tags: Array<Tag>;

  constructor(language: Language);
  constructor(collectionData: any);
  constructor(languageName: string, languagePrefix: string, languageIcon: string)
  constructor(data: Language | string | any, languagePrefix?: string, languageIcon?: string) {

    if (data instanceof Language) {
      super();
      this.language = data;
    } else if (typeof data === 'string') {
      super();
      this.language = new Language(data, languagePrefix, languageIcon);
    } else {
      super(data.id, data.status, data.createdAt, data.updatedAt);
      this.language = new Language(data.language);
      this.terms = data.terms.map(t => new Term(t));
      this.gramaticalCategories = data.gramaticalCategories.map(gc => new Category(gc));
      this.thematicCategories = data.thematicCategories.map(tc => new Category(tc));
      this.active = data.active;
      this.tags = data.tags.map(t => new Tag(t));
      return;
    }
    this.terms = [];
    this.gramaticalCategories = [];
    this.thematicCategories = [];
    this.active = false;
    this.tags = [];
  }

  public getLanguage(): Language {
    return this.language;
  }

  public setLanguage(language: Language): void {
    this.language = language;
    this.updateUpdatedTime();
  }

  public getTerms(): Term[] {
    return this.terms;
  }

  public addTerm(term: Term): void {
    term.setCollection(this);
    this.terms.push(term);
    this.updateUpdatedTime();
  }

  public addTerms(terms: Iterable<Term>): Term[] {
    for (const term of terms) {
      term.setCollection(this);
    }
    this.terms = [...this.terms, ...terms];
    this.updateUpdatedTime();
    return this.terms;
  }

  public removeTerm(termId: number): Term {
    const term = this.terms.find(t => t.getId() === termId);
    this.terms = this.terms.filter(t => t.getId() !== termId);
    term.setCollection(undefined);
    //TODO set status false?
    this.updateUpdatedTime();
    return term;
  }

  public getGramaticalCategories(): Category[] {
    return this.gramaticalCategories;
  }

  public addGramaticalCategory(category: Category): void {
    this.gramaticalCategories.push(category);
    this.updateUpdatedTime();
  }

  public removeGramaticalCategory(id: number): Category {
    const category = this.gramaticalCategories.find(c => c.getId() === id);
    this.gramaticalCategories = this.gramaticalCategories.filter(c => c.getId() !== id);
    this.updateUpdatedTime();
    return category;
  }

  public getThematicCategories(): Category[] {
    return this.thematicCategories;
  }

  public addThematicCategory(category: Category): void {
    this.thematicCategories.push(category);
    this.updateUpdatedTime();
  }

  public removeThematicCategory(id: number): Category {
    const category = this.thematicCategories.find(c => c.getId() === id);
    this.thematicCategories = this.thematicCategories.filter(c => c.getId() !== id);
    this.updateUpdatedTime();
    return category;
  }

  public isActive(): boolean {
    return this.active;
  }

  public setActive() {
    this.active = true;
    this.updateUpdatedTime();
  }

  public setInactive() {
    this.active = false;
    this.updateUpdatedTime();
  }

  public getTags(): Tag[] {
    return this.tags;
  }

  public addTag(tag: Tag): void {
    this.tags.push(tag);
    this.updateUpdatedTime();
  }

  public removeTag(id: number): Tag {
    const tag = this.tags.find(t => t.getId() === id);
    this.tags = this.tags.filter(t => t.getId() !== id);
    this.updateUpdatedTime();
    return tag;
  }
}
