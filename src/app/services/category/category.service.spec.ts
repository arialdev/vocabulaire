import {TestBed, waitForAsync} from '@angular/core/testing';

import {CategoryService} from './category.service';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {MockStorageService} from '../storage/mock-storage.service';
import {Category} from '../../classes/category/category';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {CategoryType} from '../../enums/enums';
import {CollectionService} from '../collection/collection.service';
import {TermService} from '../term/term.service';
import {Term} from '../../classes/term/term';

describe('CategoryService', () => {
  let service: CategoryService;
  let collectionService: CollectionService;
  let termService: TermService;

  let collection: Collection;
  let category: Category;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService}
      ]
    });
    service = TestBed.inject(CategoryService);
    collectionService = TestBed.inject(CollectionService);
    termService = TestBed.inject(TermService);
  });

  beforeEach(waitForAsync(() => {
    collection = new Collection('English', 'EN', new Emoji('flags', 'uk'));
    category = new Category('Verb', CategoryType.gramatical);
    initialize();
  }));

  const initialize = (): Promise<void> => new Promise(res => {
    collectionService.addCollection(collection).then((c) => {
      collectionService.setActiveCollection(c.getId()).then(cActive => {
        collection = cActive;
        res();
      });
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add category', async () => {
    const gc = await service.addCategory(category, collection.getId());
    const tc = await service.addCategory(new Category('sample2', CategoryType.thematic), collection.getId());
    collection = await collectionService.getCollectionById(collection.getId());
    expect(collection.getGramaticalCategories()).toEqual([gc]);
    expect(collection.getThematicCategories()).toEqual([tc]);
  });

  it('should throw error when adding category to non-existent collection', async () => {
    await expectAsync(service.addCategory(category, -1)).toBeRejectedWithError(`Collection with ID -1 not found`);
  });

  it('should update category', async () => {
    const gc = await service.addCategory(category, collection.getId());
    let tc = new Category('theme', CategoryType.thematic);
    tc = await service.addCategory(tc, collection.getId());

    let term = new Term('hola', 'bye');
    term.addGramaticalCategory(gc);
    term.addThematicCategory(tc);
    term = await termService.addTerm(term, collection.getId());

    const updatedGC = await service.updateCategory('Updated sample', collection.getId(), gc.getId());
    const updatedTC = await service.updateCategory('Updated sample 2', collection.getId(), tc.getId());

    collection = await collectionService.getCollectionById(collection.getId());
    term = collection.getTerms().find(t => t.getId() === term.getId());

    expect(updatedGC.getName()).toEqual('Updated sample');
    expect(updatedGC.getId()).toEqual(gc.getId());
    expect(updatedTC.getName()).toEqual('Updated sample 2');
    expect(updatedTC.getId()).toEqual(tc.getId());

    expect(term.getGramaticalCategories().find(c => c.getId() === gc.getId()).getName()).toEqual('Updated sample');
    expect(term.getThematicCategories().find(c => c.getId() === tc.getId()).getName()).toEqual('Updated sample 2');
  });

  it('should throw error when updating category from non-existent collection', async () => {
    await expectAsync(service.updateCategory('Updated sample', -1, NaN))
      .toBeRejectedWithError(`Collection with ID -1 not found`);
  });

  it('should throw error when updating non-existent category', async () => {
    await expectAsync(service.updateCategory('Updated sample', collection.getId(), -1))
      .toBeRejectedWithError(`Category with ID -1 not found`);
  });

  it('should delete category', async () => {
    const gc = await service.addCategory(category, collection.getId());
    const tc = await service.addCategory(new Category('sample2', CategoryType.thematic), collection.getId());
    let term = new Term('hola', 'hello');
    term.addGramaticalCategory(gc);
    term.addThematicCategory(tc);
    await termService.addTerm(term, collection.getId());

    await service.deleteCategory(collection.getId(), gc.getId(), gc.getType());
    collection = await collectionService.getCollectionById(collection.getId());
    expect(collection.getGramaticalCategories()).toEqual([]);

    await service.deleteCategory(collection.getId(), tc.getId(), tc.getType());
    collection = await collectionService.getCollectionById(collection.getId());
    expect(collection.getThematicCategories()).toEqual([]);
    term = collection.getTerms()[0];
    expect(term.getGramaticalCategories()).toEqual([]);
    expect(term.getThematicCategories()).toEqual([]);
  });

  it('should throw error when deleting category from non-existent collection', async () => {
    await expectAsync(service.deleteCategory(-1, NaN, CategoryType.gramatical))
      .toBeRejectedWithError(`Collection with ID -1 not found`);
  });
});
