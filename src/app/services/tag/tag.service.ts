import {Injectable} from '@angular/core';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {Tag} from '../../classes/tag/tag';
import {CollectionService} from '../collection/collection.service';
import {Collection} from '../../classes/collection/collection';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  public static maxTagsBound = 6;
  private static tagSubject: BehaviorSubject<Tag>;
  private static tagDeletion: BehaviorSubject<boolean>;

  private nextFreeID: number;

  constructor(private storageService: AbstractStorageService, private collectionService: CollectionService) {
    TagService.tagSubject = new BehaviorSubject<Tag>(undefined);
    TagService.tagDeletion = new BehaviorSubject<boolean>(false);
  }

  public static loadTag(tag: Tag): void {
    TagService.tagSubject.next(tag);
  }

  public static getTagAsObservable(): Observable<Tag> {
    return TagService.tagSubject.asObservable();
  }

  public static getTagDeletionAsObservable(): Observable<boolean> {
    return TagService.tagDeletion.asObservable();
  }

  public static getTagAsPromise(): Promise<Tag> {
    return new Promise<Tag>((resolve) => {
      this.getTagAsObservable().subscribe(res => resolve(res));
    });
  }

  /**
   * Adds a new tag into the collection indicated by its id
   *
   * @param tag
   * @param collectionId
   * @throws Error if maximum number of tags in collection is reached
   */
  public async addTag(tag: Tag, collectionId: number): Promise<Tag> {
    const collections = await this.collectionService.getCollections();
    const collection = collections.find(c => c.getId() === collectionId);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionId} not found`);
    }
    if (collection.getTags().length >= TagService.maxTagsBound) {
      throw new Error('Maximum number of tags reached');
    }
    tag.setId(await this.getNextFreeID());
    collection.addTag(tag);
    await this.storageService.set('collections', collections);
    return tag;
  }

  public async removeTag(tagId: number, collectionId: number): Promise<void> {
    const collections = await this.collectionService.getCollections();
    const collection = collections.find(c => c.getId() === collectionId);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionId} not found`);
    }
    const tag: Tag = collection.getTags().find(t => t.getId() === tagId);
    if (!tag) {
      throw new Error(`Tag with ID ${tagId} not found`);
    }
    collection.removeTag(tagId);
    await this.storageService.set('collections', collections);
    TagService.tagDeletion.next(true);
  }

  /**
   * Explores all the tags from all collections to get the highest recorded ID.
   *
   * @return The highest ID found or 0 in other case.
   * @private
   */
  private async getNextFreeID(): Promise<number> {
    if (!this.nextFreeID) {
      const collections: Collection[] = await this.collectionService.getCollections();
      this.nextFreeID = collections.reduceRight((acc, c) => Math.max(
        acc,
        c.getTags().reduceRight((acc2, t) => Math.max(acc2, t.getId() || -1), 0),
      ), 0,);
    }
    return ++this.nextFreeID;
  }
}
