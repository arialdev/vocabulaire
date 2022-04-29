import {Injectable} from '@angular/core';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {Tag} from '../../classes/tag/tag';
import {CollectionService} from '../collection/collection.service';
import {Collection} from '../../classes/collection/collection';
import {BehaviorSubject, Observable} from 'rxjs';
import {Term} from '../../classes/term/term';
import {Category} from '../../classes/category/category';
import {TagOptions} from '../../classes/tagOptions/tag-options';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  public static readonly maxTagsBound = 6;
  private static tagSubject: BehaviorSubject<Tag>;
  private static tagDeletion: BehaviorSubject<number>;

  private nextFreeID: number;

  constructor(private storageService: AbstractStorageService, private collectionService: CollectionService) {
    TagService.tagSubject = new BehaviorSubject<Tag>(undefined);
    TagService.tagDeletion = new BehaviorSubject<number>(undefined);
  }

  public static loadTag(tag: Tag): void {
    TagService.tagSubject.next(tag);
  }

  public static getTagAsObservable(): Observable<Tag> {
    return TagService.tagSubject.asObservable();
  }

  public static getTagDeletionAsObservable(): Observable<number> {
    return TagService.tagDeletion.asObservable();
  }

  public static getTagAsPromise(): Promise<Tag> {
    return new Promise<Tag>((resolve) => {
      this.getTagAsObservable().subscribe(res => resolve(res));
    });
  }

  private static sanitizeText(text: string): string {
    return text
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  public async getTagById(tagId: number, collectionId: number): Promise<Tag | undefined> {
    const collection = await this.collectionService.getCollectionById(collectionId);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionId} not found`);
    }
    return collection.getTags().find(t => t.getId() === tagId);
  }

  public async getTermsFromTag(tag: Tag, collection: Collection): Promise<Term[]>;
  public async getTermsFromTag(tagId: number, collectionId: number): Promise<Term[]>;
  public async getTermsFromTag(tagData: number | Tag, collectionData: number | Collection): Promise<Term[]> {
    let collection: Collection;
    let tag: Tag;
    if (typeof collectionData === 'number') {
      collection = await this.collectionService.getCollectionById(collectionData);
    } else {
      collection = collectionData;
    }
    if (!collection) {
      throw new Error(`Collection with ID ${collectionData} not found`);
    }
    if (typeof tagData === 'number') {
      tag = collection.getTags().find(t => t.getId() === tagData);
    } else {
      tag = tagData;
    }
    if (!tag || !collection.getTags().some(t => t.getId() === tag.getId())) {
      throw new Error(`Tag with ID ${tag?.getId() ?? tagData} not found in collection`);
    }
    return this.filterTermsByCategories(
      tag.getOptions(), this.filterTermsBySearchValue(
        tag.getOptions().getSearchText(), collection.getTerms()
      )
    );
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
    TagService.tagDeletion.next(tag.getId());
  }

  private filterTermsByCategories(tagOptions: TagOptions, terms: Term[]): Term[] {
    return terms.filter(t => {
      const gramaticalRes = t.getGramaticalCategories()
        .some(c => tagOptions.getGramaticalCategories().map((cc: Category) => cc.getId()).includes(c.getId()));
      const thematicRes = t.getThematicCategories()
        .some(c => tagOptions.getThematicCategories().map((cc: Category) => cc.getId()).includes(c.getId()));

      if (!tagOptions.getGramaticalCategories().length && !tagOptions.getThematicCategories().length) {
        return true;
      }
      if (tagOptions.getGramaticalCategories().length && !tagOptions.getThematicCategories().length) {
        return gramaticalRes;
      }
      if (!tagOptions.getGramaticalCategories().length && tagOptions.getThematicCategories().length) {
        return thematicRes;
      }
      return gramaticalRes && thematicRes;
    });
  }

  private filterTermsBySearchValue(searchValue: string, terms: Term[]): Term[] {
    const text = searchValue.toLowerCase();
    return terms.filter(t =>
      t.getOriginalTerm().toLowerCase().includes(text)
      || t.getTranslatedTerm().toLowerCase().includes(text)
      || t.getNotes().toLowerCase().includes(text)
      || TagService.sanitizeText(t.getOriginalTerm()).includes(text)
      || TagService.sanitizeText(t.getTranslatedTerm()).includes(text)
      || TagService.sanitizeText(t.getNotes()).includes(text)
    );
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
