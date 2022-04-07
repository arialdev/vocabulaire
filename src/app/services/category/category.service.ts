import {Injectable} from '@angular/core';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {Category} from '../../classes/category/category';
import {CollectionService} from '../collection/collection.service';
import {Collection} from '../../classes/collection/collection';
import {CategoryType} from '../../enums/enums';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private nextFreeID: number;

  constructor(
    private storageService: AbstractStorageService,
    private collectionService: CollectionService) {
  }

  public async addCategory(category: Category, collectionId: number): Promise<Category> {
    const collections = await this.collectionService.getCollections();
    category.setId(await this.getNextFreeID());
    const collection = collections.find(c => c.getId() === collectionId);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionId} not found`);
    }
    const type = category.getType();
    switch (type) {
      case 0:
        collection.addGramaticalCategory(category);
        break;
      case 1:
        collection.addThematicCategory(category);
        break;
    }
    await this.storageService.set('collections', collections);
    return category;
  }

  public async updateCategory(newName: string, collectionID: number, categoryID: number): Promise<Category> {
    const collections = await this.collectionService.getCollections();
    const collection = collections.find(c => c.getId() === collectionID);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionID} not found`);
    }
    const category = collections
      .flatMap(co => [...co.getGramaticalCategories(), ...co.getThematicCategories()])
      .find(c => c.getId() === categoryID);
    if (!category) {
      throw new Error(`Category with ID ${categoryID} not found`);
    }
    category.setName(newName);

    if (category.getType() === 0) {
      collection.getTerms().forEach(t => t.getGramaticalCategories().forEach(gc => {
        if (gc.getId() === categoryID) {
          gc.setName(newName);
        }
      }));
    } else {
      collection.getTerms().forEach(t => t.getThematicCategories().forEach(tc => {
        if (tc.getId() === categoryID) {
          tc.setName(newName);
        }
      }));
    }


    await this.storageService.set('collections', collections);
    return category;
  }

  public async deleteCategory(collectionID: number, categoryID: number, type: CategoryType): Promise<void> {
    const collections = await this.collectionService.getCollections();
    const collection: Collection = collections.find(c => c.getId() === collectionID);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionID} not found`);
    }
    if (type === 0) {
      collection.removeGramaticalCategory(categoryID);
      collection.getTerms().forEach(t => t.removeGramaticalCategory(categoryID));
    } else {
      collection.removeThematicCategory(categoryID);
      collection.getTerms().forEach(t => t.removeThematicCategory(categoryID));
    }
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
