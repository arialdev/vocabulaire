import {Injectable} from '@angular/core';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {Category} from '../../classes/category/category';
import {CollectionService} from '../collection/collection.service';
import {Collection} from '../../classes/collection/collection';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private nextFreeID: number;

  constructor(
    private storageService: AbstractStorageService,
    private collectionService: CollectionService) {
  }

  public async addGramaticalCategory(collectionId: number, category: Category): Promise<void> {
    const collections = await this.collectionService.getCollections();
    category.setId(await this.getNextFreeID());
    const collection = collections.find(c => c.getId() === collectionId);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionId} not found`);
    }
    collection.addGramaticalCategory(category);
    return this.storageService.set('collections', collections);
  }

  public async addThematicCategory(collectionId: number, category: Category): Promise<void> {
    const collections = await this.collectionService.getCollections();
    category.setId(await this.getNextFreeID());
    const collection = collections.find(c => c.getId() === collectionId);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionId} not found`);
    }
    collection.addThematicCategory(category);
    return this.storageService.set('collections', collections);
  }

  public async updateGramaticalCategory(newName: string, collectionID: number, categoryID: number): Promise<Category> {
    const collections = await this.collectionService.getCollections();
    const collection = collections.find(c => c.getId() === collectionID);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionID} not found`);
    }
    const category = collection.getGramaticalCategories().find(c => c.getId() === categoryID);
    if (!category) {
      throw new Error(`Category with ID ${categoryID} not found`);
    }
    category.setName(newName);
    await this.storageService.set('collections', collections);
    return category;
  }

  public async updateThematicCategory(newName: string, collectionID: number, categoryID: number): Promise<Category> {
    const collections = await this.collectionService.getCollections();
    const collection = collections.find(c => c.getId() === collectionID);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionID} not found`);
    }
    const category = collection.getThematicCategories().find(c => c.getId() === categoryID);
    if (!category) {
      throw new Error(`Category with ID ${categoryID} not found`);
    }
    category.setName(newName);
    await this.storageService.set('collections', collections);
    return category;
  }

  public async deleteGramaticalCategory(collectionID: number, categoryID: number): Promise<void> {
    const collections = await this.collectionService.getCollections();
    const collection: Collection = collections.find(c => c.getId() === collectionID);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionID} not found`);
    }
    collection.removeGramaticalCategory(categoryID);
    await this.storageService.set('collections', collections);
  }

  public async deleteThematicCategory(collectionID: number, categoryID: number): Promise<void> {
    const collections = await this.collectionService.getCollections();
    const collection: Collection = collections.find(c => c.getId() === collectionID);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionID} not found`);
    }
    collection.removeThematicCategory(categoryID);
    await this.storageService.set('collections', collections);
  }

  /**
   * Explores all the categories (gramatical and thematic) from all collections to get the highest recorded ID.
   *
   * @return The highest ID found or 0 in other case.
   * @private
   */
  private async getNextFreeID(): Promise<number> {
    if (!this.nextFreeID) {
      const collections: Collection[] = await this.collectionService.getCollections();
      this.nextFreeID = collections.reduceRight((acc, c) => Math.max(
        acc,
        c.getGramaticalCategories().reduceRight((acc2, gc) => Math.max(acc2, gc.getId() || -1), 0),
        c.getThematicCategories().reduceRight((acc2, gc) => Math.max(acc2, gc.getId() || -1), 0),
      ), 0,);
    }
    return ++this.nextFreeID;
  }
}