import {Injectable} from '@angular/core';
import {Collection} from '../../classes/collection/collection';
import {AbstractStorageService} from '../storage/abstract-storage-service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  private activeCollection: Collection;

  constructor(private storageService: AbstractStorageService) {
  }

  public async getActiveCollection(): Promise<Collection> {
    if (this.activeCollection) {
      return this.activeCollection;
    }

    const collections: Collection[] = await this.getCollections();
    const collection = collections.find((c: Collection) => c.isActive() && c.getStatus());
    if (!collection) {
      console.error('No active collection found!');
    } else {
      this.activeCollection = collection;
    }
    return this.activeCollection;
  }

  public async setActiveCollection(id: number): Promise<Collection> {
    const collections: Collection[] = await this.getCollections();
    let found;
    const filtered = collections.map((c) => {
      c.setInactive();
      if (c.getId() === id && c.getStatus()) {
        c.setActive();
        found = c;
      }
      return c;
    });
    if (!found) {
      console.error('Could not find collection');
      return;
    }
    this.activeCollection = found;
    await this.storageService.set('collections', filtered);
    return this.activeCollection;
  }


  public async addCollection(collection: Collection): Promise<Collection> {
    const collections = await this.getCollections();
    collection.setId(await this.getNextFreeID());
    collections.push(collection);
    await this.storageService.set('collections', collections);
    return collection;
  }

  public async removeCollection(id: number): Promise<void> {
    const collections = await this.getCollections();
    const updatedCollections = collections.map(c => {
      if (c.getId() === id) {
        if (c.isActive()) {
          throw new Error('Cannot delete active collection');
        }
        c.setStatus(false);
      }
      return c;
    });
    await this.storageService.set('collections', updatedCollections);
  }

  public async getCollections(): Promise<Collection[]> {
    const collections = await this.storageService.get('collections');
    return collections.map(c => new Collection(c)).filter(c => c.getStatus());
  }

  public async getCollectionById(id: number): Promise<Collection> {
    const collections = await this.getCollections();
    return collections.find(c => c.getId() === id && c.getStatus());
  }

  public async updateCollectionById(id: number, collection: Collection): Promise<Collection> {
    const collections = await this.getCollections();
    const editedCollections = collections.map(c => {
      if (c.getId() === id) {
        c.setLanguage(collection.getLanguage());
      }
      return c;
    });
    await this.storageService.set('collections', editedCollections);
    return this.getCollectionById(id);
  }

  public sortCollections(collections: Collection[]): Collection[] {
    return collections.sort((c1: Collection, c2: Collection) => {
      if (!(c1.isActive() || c2.isActive())) {
        return 1;
      }
      if (c1.isActive()) {
        return -1;
      }
      return 1;
    });
  }

  private async getNextFreeID(): Promise<number> {
    return this.storageService.getNextFreeId('collections');
  }
}
