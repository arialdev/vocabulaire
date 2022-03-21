import {Injectable} from '@angular/core';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {CollectionService} from '../collection/collection.service';
import {Collection} from '../../classes/collection/collection';
import {Term} from '../../classes/term/term';

@Injectable({
  providedIn: 'root'
})
export class TermService {

  private nextFreeID: number;

  constructor(
    private storageService: AbstractStorageService,
    private collectionService: CollectionService) {
  }

  public async addTerm(newTerm: Term, collectionID: number): Promise<Term> {
    const collections = await this.collectionService.getCollections();
    const collection = collections.find(c => c.getId() === collectionID);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionID} not found`);
    }

    //Prune controversial categories
    const assignedGc = newTerm.getGramaticalCategories();
    const gramaticalCategories = collection.getGramaticalCategories();
    for (const gc of assignedGc) {
      if (!gramaticalCategories.filter(c => c.getId() === gc.getId()).length) {
        newTerm.removeGramaticalCategory(gc.getId());
      }
    }
    const assignedTc = newTerm.getThematicCategories();
    const thematicCategories = collection.getThematicCategories();
    for (const tc of assignedTc) {
      if (!thematicCategories.filter(c => c.getId() === tc.getId()).length) {
        newTerm.removeThematicCategory(tc.getId());
      }
    }

    newTerm.setId(await this.getNextFreeID());
    collection.addTerm(newTerm);
    await this.storageService.set('collections', collections);
    return newTerm;
  }

  /**
   * Explores all the terms from all collections to get the highest recorded ID.
   *
   * @return The highest ID found or 0 in other case.
   * @private
   */
  private async getNextFreeID(): Promise<number> {
    if (!this.nextFreeID) {
      const collections: Collection[] = await this.collectionService.getCollections();
      this.nextFreeID = collections.reduceRight((acc, c) => Math.max(
        acc,
        c.getTerms().reduceRight((acc2, t) => Math.max(acc2, t.getId() || -1), 0),
      ), 0,);
    }
    return ++this.nextFreeID;
  }
}
