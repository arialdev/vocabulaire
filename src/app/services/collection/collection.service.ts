import {Injectable} from '@angular/core';
import {Collection} from '../../classes/collection/collection';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  public currentActiveCollection: Observable<Collection>;
  private activeCollectionSubject: BehaviorSubject<Collection>;

  private nextFreeID;

  constructor(private storageService: AbstractStorageService) {
    this.activeCollectionSubject = new BehaviorSubject<Collection>(undefined);
    this.currentActiveCollection = this.activeCollectionSubject.asObservable();
  }

  public async getActiveCollection(): Promise<Collection> {
    const collections: Collection[] = await this.getCollections();
    const collection = collections.find((c: Collection) => c.isActive() && c.getStatus());
    if (!collection) {
      throw new Error('No active collection found!');
    }
    this.activeCollectionSubject.next(collection);
    return collection;
  }

  public async setActiveCollection(id: number): Promise<Collection> {
    const collections: Collection[] = await this.getCollections();
    collections.forEach(c => c.setInactive());
    const activeCollection = collections.find(c => c.getId() === id);
    if (!activeCollection) {
      throw new Error(`Could not find collection with ID ${id}`);
    }
    activeCollection.setActive();
    await this.storageService.set('collections', collections);
    this.activeCollectionSubject.next(activeCollection);
    return activeCollection;
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
    const collection = collections.find(c => c.getId() === id);
    if (!collection) {
      throw new Error(`Could not find collection with ID ${id}`);
    }
    if (collection.isActive()) {
      throw new Error('Cannot delete active collection');
    }
    await this.storageService.set('collections', collections.filter(c => c.getId() !== id));
  }

  public async getCollections(): Promise<Collection[]> {
    const collections = await this.storageService.get('collections');
    return collections.map(c => new Collection(c));
  }

  public async getCollectionById(id: number): Promise<Collection> {
    const collections = await this.getCollections();
    return collections.find(c => c.getId() === id && c.getStatus());
  }

  public async updateCollectionById(id: number, collectionData: Collection): Promise<Collection> {
    const collections = await this.getCollections();
    const collection = collections.find(c=>c.getId()===id);
    if(!collection){
      throw new Error(`Could not find collection with ID ${id}`);
    }
    collection.setLanguage(collectionData.getLanguage());
    await this.storageService.set('collections', collections);
    return collection;
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
    if (!this.nextFreeID) {
      this.nextFreeID = (await this.getCollections())
        .map(c => c.getId())
        .reduce((acc, id) => Math.max(acc, id ?? 0), 0);
    }
    return ++this.nextFreeID;
  }
}
