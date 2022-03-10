import {Collection} from '../collection/collection';
import {Category} from '../../interfaces/category';

export class Term {
  private id: number;
  private collection: Collection;
  private originalTerm: string;
  private translatedTerm: string;
  private notes: string;
  private gramaticalCategories: Array<Category>;
  private thematicCategories: Array<Category>;
  private status: boolean;
  private createdAt: number;
  private updatedAt: number;

  constructor(collection: Collection, originalTerm: string, translatedTerm: string, notes: string = '') {
    this.collection = collection;
    this.originalTerm = originalTerm;
    this.translatedTerm = translatedTerm;
    this.notes = notes;
    this.gramaticalCategories = [];
    this.thematicCategories = [];
    this.status = true;
    this.updateCreationTime();
    this.updateUpdatedTime();
  }

  public getId(): number {
    return this.id;
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

  public getStatus(): boolean {
    return this.status;
  }

  public getCreationTime(): number {
    return this.createdAt;
  }

  public getUpdatingTime(): number {
    return this.updatedAt;
  }

  public setId(id: number): void {
    this.id = id;
    this.updateUpdatedTime();
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
    const category = this.gramaticalCategories.find(c => c.id === categoryId);
    this.gramaticalCategories = this.gramaticalCategories.filter(c => c.id !== categoryId);
    this.updateUpdatedTime();
    return category;
  }

  public removeThematicCategory(categoryId: number): Category {
    const category = this.thematicCategories.find(c => c.id === categoryId);
    this.thematicCategories = this.thematicCategories.filter(c => c.id !== categoryId);
    this.updateUpdatedTime();
    return category;
  }

  public setStatus(status: boolean) {
    this.status = status;
    this.updateUpdatedTime();
  }

  private updateCreationTime(time: number = undefined): void {
    this.createdAt = new Date().getTime();
    this.updateUpdatedTime();
  }

  private updateUpdatedTime(time: number = undefined): void {
    this.updatedAt = new Date().getTime();
  }
}
