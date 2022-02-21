import {TestBed} from '@angular/core/testing';
import {Drivers} from '@ionic/storage';
import {CollectionService} from './collection.service';
import {IonicStorageModule} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Collection} from '../../interfaces/collection';
import {StorageService} from '../storage/storage.service';


describe('CollectionService', () => {
  let service: CollectionService;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot({
        // eslint-disable-next-line no-underscore-dangle
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
      }),],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(CollectionService);
    storage = TestBed.inject(StorageService);
    storage.set('collections', []);
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
    const collection1: Collection = {
      active: true,
      createdAt: new Date().getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: undefined,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date().getTime(),
    };

    const collection2: Collection = {
      active: false,
      createdAt: new Date().getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: undefined,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date().getTime(),
    };

    service.addCollection(collection1).then((c1: Collection) => {
      service.addCollection(collection2).then((c2: Collection) => {
        service.getActiveCollection().then(caPre => {
          expect(caPre.id).toBe(c1.id);
          service.setActiveCollection(c2.id).then(() => {
            service.getActiveCollection().then((cActive: Collection) => {
              expect(cActive.id).toEqual(c2.id);
              done();
            });
          });
        });
      });
    });
  });

  it('should add new collection', (done) => {
    const collection: Collection = {
      active: false,
      createdAt: new Date().getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: undefined,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date().getTime(),
    };
    service.addCollection(collection).then((c: Collection) => {
      expect(c.id).toBeGreaterThan(0);
      expect(c.language).toEqual(collection.language);
      service.getCollections().then((cs: Collection[]) => {
        expect(cs.some(c2 => c2.id === c.id)).toBeTruthy();
        done();
      });
    });
  });

  it('should remove collection', (done) => {
    const newCollection: Collection = {
      active: false,
      createdAt: new Date().getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: undefined,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date().getTime(),
    };

    service.addCollection(newCollection).then((collection: Collection) => {
      service.removeCollection(collection.id).then(_ => {
        service.getCollections().then((collections: Collection[]) => {
          const filtered = collections.filter(c => c.id === collection.id);
          expect(filtered.length).toBe(1);
          expect(filtered[0].status).toBeFalsy();
          done();
        });
      });
    });
  });

  it('should delete active collection', (done) => {
    const newCollection: Collection = {
      active: false,
      createdAt: new Date().getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: undefined,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date().getTime(),
    };

    service.addCollection(newCollection).then((collection: Collection) => {
      service.setActiveCollection(collection.id).then(() => {
        service.removeCollection(collection.id).then(() => {
          service.getCollections().then((collections: Collection[]) => {
            const filtered = collections.filter(c => c.id === collection.id);
            expect(filtered?.[0].status).toBeFalsy();
            done();
          });
        });
      });
    });
  });

  it('should set active collection', (done) => {
    const collection: Collection = {
      active: false,
      createdAt: new Date().getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: undefined,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date().getTime(),
    };

    service.addCollection(collection).then((newC1: Collection) => {
      service.addCollection(collection).then((newC2: Collection) => {
        service.getActiveCollection().then((activeC0: Collection) => {
          expect(newC1.id).not.toEqual(activeC0?.id);
          service.setActiveCollection(newC1.id).then(activeC1 => {
            expect(activeC1.id).not.toEqual(activeC0?.id);
            expect(activeC1.id).toEqual(newC1.id);
            service.getActiveCollection().then((activeC2: Collection) => {
              expect(activeC2).toEqual(activeC1);
              done();
            });
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

});
