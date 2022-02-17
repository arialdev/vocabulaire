import {Injectable} from '@angular/core';
import {StorageService} from '../storage/storage.service';
import {Collection} from '../../interfaces/collection';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  private activeCollection: Collection;

  constructor(private storageService: StorageService) {
  }

  public async getActiveCollection(): Promise<Collection> {
    if (this.activeCollection) {
      return this.activeCollection;
    }

    const collections: Collection[] = await this.getCollections();
    const collection = collections.find((c: Collection) => c.active && c.status);
    if (!collection) {
      console.error('No active collection found!');
    } else {
      this.activeCollection = collection;
    }
    return this.activeCollection;
  }

  public async setActiveCollection(id: number): Promise<Collection> {
    const collections: Collection[] = await this.getCollections();
    const collection = collections.find(c => c.status && c.id === id);
    if (!collection) {
      console.error('Could not find collection');
      return;
    }
    this.activeCollection = collection;
    return this.activeCollection;
  }


  public async addCollection(collection: Collection): Promise<Collection> {
    const collections = await this.getCollections();
    collection.id = await this.getNextFreeID();
    collections.push(collection);
    await this.storageService.set('collections', collections);
    return collection;
  }

  public async removeCollection(id): Promise<void> {
    const collections = await this.getCollections();
    const filtered = collections.map(c => {
      if (c.id === id) {
        c.status = false;
        if (c.active) {
          c.active = false;
          this.activeCollection = collections.find(x => x.status);
        }
      }
      return c;
    });
    await this.storageService.set('collections', filtered);
  }

  public async getCollections() {
    const collections: Collection[] = await this.storageService.get('collections');
    return collections;
  }

  private async getNextFreeID(): Promise<number> {
    return this.storageService.getNextFreeId('collections');
  }
}
