import {TestBed, waitForAsync} from '@angular/core/testing';

import {TermService} from './term.service';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {MockStorageService} from '../storage/mock-storage.service';
import {Collection} from '../../classes/collection/collection';
import {Term} from '../../classes/term/term';
import {Emoji} from '../../classes/emoji/emoji';
import {CollectionService} from '../collection/collection.service';
import {Category} from '../../classes/category/category';
import {CategoryType} from '../../enums/enums';

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
    const ctg = CategoryType.gramatical;
    const ctt = CategoryType.thematic;
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

  it('should delete term', async () => {
    const newTerm1 = await service.addTerm(term, collection.getId());
    await service.deleteTerm(newTerm1.getId(), collection.getId());
    collection = await collectionService.getCollectionById(collection.getId());
    expect(collection.getTerms()).toEqual([]);
  });

  it('should throw error if invalid collection reference when deleting term', async () => {
    await expectAsync(service.deleteTerm(-1, -1)).toBeRejectedWithError(`Collection with ID -1 not found`);
  });

  it('should update term', async () => {
    const oldC1 = new Category('csampleCOld', CategoryType.gramatical);
    const oldC2 = new Category('csampleTOld', CategoryType.thematic);
    term.addGramaticalCategory(oldC1);
    term.addThematicCategory(oldC2);
    term = await service.addTerm(term, collection.getId());

    const newTerm: Term = new Term('sample', 'ejemplo', 'this is a note');
    const newC1 = new Category('csampleC', CategoryType.gramatical);
    const newC2 = new Category('csampleT', CategoryType.thematic);
    term.addGramaticalCategory(newC1);
    term.addThematicCategory(newC2);

    const updatedTerm = await service.updateTerm(term.getId(), newTerm, collection.getId());
    expect(updatedTerm.getOriginalTerm()).toEqual(newTerm.getOriginalTerm());
    expect(updatedTerm.getTranslatedTerm()).toEqual(newTerm.getTranslatedTerm());
    expect(updatedTerm.getNotes()).toEqual(newTerm.getNotes());
    expect(updatedTerm.getGramaticalCategories()).toEqual(newTerm.getGramaticalCategories());
    expect(updatedTerm.getThematicCategories()).toEqual(newTerm.getThematicCategories());
  });

  it('should throw error if invalid collection or term reference when updating term', async () => {
    const newTerm: Term = new Term('sample', 'ejemplo', 'this is a note');
    await expectAsync(service.updateTerm(-1, newTerm, -1)).toBeRejectedWithError(`Collection with ID -1 not found`);
    await expectAsync(service.updateTerm(-1, newTerm, collection.getId())).toBeRejectedWithError(`Term with ID -1 not found`);
  });
});
