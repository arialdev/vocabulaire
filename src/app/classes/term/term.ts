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

  constructor(originalTerm: string, translatedTerm: string, notes?: string, collection?: Collection);
  constructor(originalTerm: string, translatedTerm: string, collection: Collection);
  constructor(originalTerm: string, translatedTerm: string, extra1?: string | Collection, extra2?: Collection) {
    super();
    this.originalTerm = originalTerm;
    this.translatedTerm = translatedTerm;
    this.gramaticalCategories = [];
    this.thematicCategories = [];

    if (extra2 && extra2 instanceof Collection) {
      this.collection = extra2;
    }
    if (extra1 && typeof extra1 === 'string') {
      this.notes = extra1;
    } else {
      this.notes = '';
    }
    if (extra1 && extra1 instanceof Collection) {
      this.collection = extra1;
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
