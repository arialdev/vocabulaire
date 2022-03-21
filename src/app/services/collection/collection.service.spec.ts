import {TestBed} from '@angular/core/testing';
import {CollectionService} from './collection.service';
import {Collection} from '../../classes/collection/collection';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {MockStorageService} from '../storage/mock-storage.service';
import {Emoji} from '../../classes/emoji/emoji';

describe('CollectionService', () => {
  let service: CollectionService;

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
    mockActiveCollection = new Collection('English', 'EN', new Emoji('uk', 'flags'));
    mockActiveCollection.setActive();
    mockInactiveCollection = new Collection('French', 'FR', new Emoji('fr', 'flags'));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get active default collection when none exists', async () => {
    await expectAsync(service.getActiveCollection()).toBeRejectedWithError('No active collection found!');
  });

  it('should get active collection', (done) => {
    service.addCollection(mockActiveCollection).then((newCActive: Collection) => {
      service.addCollection(mockInactiveCollection).then((newCInactive: Collection) => {
        service.getActiveCollection().then(cActive1 => {
          expect(cActive1.getId()).toBe(newCActive.getId());
          service.setActiveCollection(newCInactive.getId()).then(() => {
            service.getActiveCollection().then((cActive2: Collection) => {
              expect(cActive2.getId()).toEqual(newCInactive.getId());
              done();
            });
          });
        });
      });
    });
  });

  it('should add new collection', (done) => {
    service.addCollection(mockInactiveCollection).then((c: Collection) => {
      expect(c.getId()).toBeGreaterThan(0);
      expect(c.getLanguage()).toEqual(mockInactiveCollection.getLanguage());
      service.getCollections().then((cs: Collection[]) => {
        expect(cs.some(c2 => c2.getId() === c.getId())).toBeTruthy();
        done();
      });
    });
  });

  it('should remove collection', (done) => {
    service.addCollection(mockInactiveCollection).then((collection: Collection) => {
      service.removeCollection(collection.getId()).then(_ => {
        service.getCollections().then((collections: Collection[]) => {
          const filtered = collections.filter(c => c.getId() === collection.getId());
          expect(filtered.length).toBe(0);
          done();
        });
      });
    });
  });

  it('should not delete active collection', (done) => {
    service.addCollection(mockInactiveCollection).then((collection: Collection) => {
      service.setActiveCollection(collection.getId()).then(() => {
        expectAsync(service.removeCollection(collection.getId())).toBeRejected().then(() => {
          done();
        });
      });
    });
  });

  it('should set active collection', (done) => {
    service.addCollection(mockInactiveCollection).then((newC1: Collection) => {
      service.setActiveCollection(newC1.getId()).then(activeC1 => {
        expect(activeC1.getId()).toBe(newC1.getId());
        service.getActiveCollection().then((activeC2: Collection) => {
          expect(activeC2.getId()).toBe(activeC1.getId());
          done();
        });
      });
    });
  });

  it('should return undefined when setting a not found collection as active', async () => {
    await expectAsync(service.setActiveCollection(-1)).toBeRejectedWithError('Could not find collection with ID -1');
  });

  it('should get collection by its ID', (done) => {
    service.addCollection(mockInactiveCollection).then((c) => {
      service.getCollectionById(c.getId()).then(c2 => {
        expect(c).toEqual(c2);
        done();
      });
    });
  });

  it('should update collection by its ID', (done) => {
    service.addCollection(mockInactiveCollection).then((c) => {
      const oldUpdatedTime = c.getUpdatingTime();
      service.updateCollectionById(c.getId(), mockInactiveCollection).then((updatedC) => {
        expect(c.getId()).toBe(updatedC.getId());
        expect(updatedC.getUpdatingTime).not.toBe(oldUpdatedTime);
        done();
      });
    });
  });
});
