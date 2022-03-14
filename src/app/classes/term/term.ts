import {Collection} from '../collection/collection';
import {Category} from '../category/category';
import {StoringItem} from '../storing-item';

export class Term extends StoringItem {
  private collection: Collection;
  private originalTerm: string;
  private translatedTerm: string;
  private notes: string;
  private gramaticalCategories: Array<Category>;
  private thematicCategories: Array<Category>;

  constructor(data);
  constructor(originalTerm: string, translatedTerm: string, collection: Collection);
  constructor(originalTerm: string, translatedTerm: string, notes: string, collection: Collection);
  constructor(data: string | any, translatedTerm?: string, extra1?: Collection | string, extra2?: Collection) {
    if (typeof data === 'string' && translatedTerm !== undefined) {
      super();
      this.originalTerm = data;
      this.translatedTerm = translatedTerm;
      this.gramaticalCategories = [];
      this.thematicCategories = [];

      if (typeof extra1 === 'string' && extra2 instanceof Collection) {
        this.notes = extra1;
        this.collection = extra2;
      } else if (extra1 instanceof Collection) {
        this.collection = extra1;
        this.notes = '';
      }

      if (extra1 && extra1 instanceof Collection) {
        this.collection = extra1;
      }
    } else {
      super(data.id, data.status, data.createdAt, data.updatedAt);
      this.collection = new Collection(data.collection);
      this.originalTerm = data.originalTerm;
      this.translatedTerm = data.translatedTerm;
      this.notes = data.notes;
      this.gramaticalCategories = data.gramaticalCategories.map(gc => new Category(gc));
      this.thematicCategories = data.thematicCategories.map(tc => new Category(tc));
    }
  }

  public getCollection(): Collection {
    return this.collection;
  }

  public getOriginalTerm(): string {
    return this.originalTerm;
  }

  public getTranslatedTerm(): string {
    return this.translatedTerm;
  }

  public getNotes(): string {
    return this.notes;
  }

  public getGramaticalCategories(): Category[] {
    return this.gramaticalCategories;
  }

  public getThematicCategories(): Category[] {
    return this.thematicCategories;
  }

  public setCollection(collection: Collection): void {
    this.collection = collection;
    this.updateUpdatedTime();
  }

  public setOriginalTerm(term: string): void {
    this.originalTerm = term;
    this.updateUpdatedTime();
  }

  public setTranslatedTerm(translation: string): void {
    this.translatedTerm = translation;
    this.updateUpdatedTime();
  }

  public setNotes(notes: string): void {
    this.notes = notes;
    this.updateUpdatedTime();
  }

  public addGramaticalCategory(category: Category): void {
    this.gramaticalCategories.push(category);
    this.updateUpdatedTime();
  }

  public addThematicCategory(category: Category): void {
    this.thematicCategories.push(category);
    this.updateUpdatedTime();
  }

  public addGramaticalCategories(categories: Iterable<Category>): void {
    this.gramaticalCategories = [...this.gramaticalCategories, ...categories];
    this.updateUpdatedTime();
  }

  public addThematicCategories(categories: Iterable<Category>): void {
    this.thematicCategories = [...this.thematicCategories, ...categories];
    this.updateUpdatedTime();
  }

  public removeGramaticalCategory(categoryId: number): Category {
    const category = this.gramaticalCategories.find(c => c.getId() === categoryId);
    this.gramaticalCategories = this.gramaticalCategories.filter(c => c.getId() !== categoryId);
    this.updateUpdatedTime();
    return category;
  }

  public removeThematicCategory(categoryId: number): Category {
    const category = this.thematicCategories.find(c => c.getId() === categoryId);
    this.thematicCategories = this.thematicCategories.filter(c => c.getId() !== categoryId);
    this.updateUpdatedTime();
    return category;
  }
}
