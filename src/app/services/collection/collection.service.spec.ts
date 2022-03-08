import {TestBed} from '@angular/core/testing';
import {CollectionService} from './collection.service';
import {Collection} from '../../classes/collection/collection';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {MockStorageService} from '../storage/mock-storage.service';
import {Language} from '../../classes/language/language';


describe('CollectionService', () => {
  let service: CollectionService;

  let mockLanguage1: Language;
  let mockLanguage2: Language;
  let mockActiveCollection: Collection;
  let mockInactiveCollection: Collection;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: AbstractStorageService, useClass: MockStorageService}],
      teardown: {destroyAfterEach: true},
    });
    service = TestBed.inject(CollectionService);
  });

  beforeEach(() => {
    mockLanguage1 = {
      createdAt: new Date(2020, 1, 1).getTime(),
      icon: 'assets/img/emojis/uk.png',
      id: 1,
      name: 'English',
      prefix: 'EN',
      status: true,
      updatedAt: new Date(2020, 1, 2).getTime(),
    };

    mockLanguage2 = {
      createdAt: new Date(2020, 1, 1).getTime(),
      icon: 'assets/img/emojis/fr.png',
      id: 1,
      name: 'French',
      prefix: 'FR',
      status: true,
      updatedAt: new Date(2020, 1, 2).getTime(),
    };

    mockActiveCollection = {
      active: true,
      createdAt: new Date(2020, 1, 1).getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: mockLanguage1,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date(2020, 1, 2).getTime(),
    };
    mockInactiveCollection = {
      active: false,
      createdAt: new Date(2020, 1, 1).getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: mockLanguage2,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date(2020, 1, 2).getTime(),
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get active default collection when none exists', (done) => {
    service.getActiveCollection().then((collection: Collection) => {
      expect(collection).toBeUndefined();
      done();
    });
  });

  it('should get active collection', (done) => {
    service.addCollection(mockActiveCollection).then((newCActive: Collection) => {
      service.addCollection(mockInactiveCollection).then((newCInactive: Collection) => {
        service.getActiveCollection().then(cActive1 => {
          expect(cActive1.id).toBe(newCActive.id);
          service.setActiveCollection(newCInactive.id).then(() => {
            service.getActiveCollection().then((cActive2: Collection) => {
              expect(cActive2.id).toEqual(newCInactive.id);
              done();
            });
          });
        });
      });
    });
  });

  it('should add new collection', (done) => {
    service.addCollection(mockInactiveCollection).then((c: Collection) => {
      expect(c.id).toBeGreaterThan(0);
      expect(c.language).toEqual(mockInactiveCollection.language);
      service.getCollections().then((cs: Collection[]) => {
        expect(cs.some(c2 => c2.id === c.id)).toBeTruthy();
        done();
      });
    });
  });

  it('should remove collection', (done) => {
    service.addCollection(mockInactiveCollection).then((collection: Collection) => {
      service.removeCollection(collection.id).then(_ => {
        service.getCollections().then((collections: Collection[]) => {
          const filtered = collections.filter(c => c.id === collection.id);
          expect(filtered.length).toBe(0);
          done();
        });
      });
    });
  });

  it('should not delete active collection', (done) => {
    service.addCollection(mockInactiveCollection).then((collection: Collection) => {
      service.setActiveCollection(collection.id).then(() => {
        expectAsync(service.removeCollection(collection.id)).toBeRejected().then(() => {
          done();
        });
      });
    });
  });

  it('should set active collection', (done) => {
    service.addCollection(mockInactiveCollection).then((newC1: Collection) => {
      service.getActiveCollection().then((activeC0: Collection) => {
        expect(newC1.id).not.toEqual(activeC0?.id);
        service.setActiveCollection(newC1.id).then(activeC1 => {
          expect(activeC1.id).not.toBe(activeC0?.id);
          expect(activeC1.id).toBe(newC1.id);
          service.getActiveCollection().then((activeC2: Collection) => {
            expect(activeC2.id).toBe(activeC1.id);
            done();
          });
        });
      });
    });
  });

  it('given no collections when getting active collection then return undefined', (done) => {
    service.removeCollection(1).then(_ => {
      service.getActiveCollection().then(c => {
        expect(c).toBeUndefined();
        done();
      });
    });
  });

  it('should return undefined when setting a not found collection as active', (done) => {
    service.setActiveCollection(-1).then(c => {
      expect(c).toBeUndefined();
      done();
    });
  });

  it('should get collection by its ID', (done) => {
    service.addCollection(mockInactiveCollection).then((c) => {
      service.getCollectionById(c.id).then(c2 => {
        expect(c).toEqual(c2);
        done();
      });
    });
  });

  it('should update collection by its ID', (done) => {
    service.addCollection(mockInactiveCollection).then((c) => {
      const oldUpdatedTime = c.updatedAt;
      service.updateCollectionById(c.id, mockInactiveCollection).then((updatedC) => {
        expect(c.id).toBe(updatedC.id);
        expect(updatedC.updatedAt).not.toBe(oldUpdatedTime);
        done();
      });
    });
  });

});
