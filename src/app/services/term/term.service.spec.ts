import {TestBed, waitForAsync} from '@angular/core/testing';

import {TermService} from './term.service';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {MockStorageService} from '../storage/mock-storage.service';
import {Collection} from '../../classes/collection/collection';
import {Term} from '../../classes/term/term';
import {Emoji} from '../../classes/emoji/emoji';
import {TermPage} from '../../pages/term/term.page';
import {CollectionService} from '../collection/collection.service';
import {Category} from '../../classes/category/category';
import {CategoryType} from '../../classes/categoryType/category-type';

describe('TermService', () => {
  let service: TermService;

  let term: Term;
  let collection: Collection;
  let collectionService: CollectionService;
  let c1: Category;
  let c2: Category;
  let c3: Category;
  let c4: Category;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService}
      ],
    });
    service = TestBed.inject(TermService);
    collectionService = TestBed.inject(CollectionService);
  });

  beforeEach(waitForAsync(() => {
    const ctg = new CategoryType('gramatical');
    const ctt = new CategoryType('thematic');
    c1 = new Category('noun', ctg);
    c1.setId(1);
    c2 = new Category('verb', ctg);
    c2.setId(2);
    c3 = new Category('body', ctt);
    c3.setId(3);
    c4 = new Category('family', ctt);
    c4.setId(4);
    collection = new Collection('English', 'EN', new Emoji('flags', 'uk'));
    collection.addGramaticalCategory(c1);
    collection.addThematicCategory(c3);
    initialize();
    term = new Term('Hand', 'Mano', 'Es una mano');
    term.addGramaticalCategories([c1, c2]);
    term.addThematicCategories([c3, c4]);
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

  it('should add term', async () => {
    const newTerm = await service.addTerm(term, collection.getId());
    expect(newTerm.getGramaticalCategories()).toEqual([c1]);
    expect(newTerm.getThematicCategories()).toEqual([c3]);
    const terms: Term[] = (await collectionService.getCollections()).flatMap(c => c.getTerms());
    expect(terms).toContain(newTerm);
  });

  it('should throw error if invalid collection reference when adding new term', async () => {
    await expectAsync(service.addTerm(term, NaN)).toBeRejectedWithError(`Collection with ID ${NaN} not found`);
  });

  it('should increment id', async () => {
    const newTerm1 = await service.addTerm(term, collection.getId());
    const newTerm2 = await service.addTerm(new Term('sample', 'ejemplo'), collection.getId());
    expect([newTerm1.getId(), newTerm2.getId()]).toEqual([1, 2]);
  });
});
