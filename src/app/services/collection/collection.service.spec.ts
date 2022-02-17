import {TestBed} from '@angular/core/testing';
import {Drivers} from '@ionic/storage';
import {CollectionService} from './collection.service';
import {IonicStorageModule} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Collection} from '../../interfaces/collection';


describe('CollectionService', () => {
  let service: CollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot({
        // eslint-disable-next-line no-underscore-dangle
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
      }),],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(CollectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get active default collection', (done) => {
    service.getActiveCollection().then((collection: Collection) => {
      expect(collection.language.prefix).toBe('es');
      done();
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
    const id = 1;
    service.removeCollection(id).then(_ => {
      service.getCollections().then((collections: Collection[]) => {
        const filtered = collections.filter(c => c.id === id);
        expect(filtered.length).toBe(1);
        expect(filtered[0].status).toBeFalsy();
        done();
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

    service.addCollection(collection).then((c: Collection) => {
      service.getActiveCollection().then((ca: Collection) => {
        expect(c).not.toEqual(ca);
        service.setActiveCollection(c.id).then(ca2 => {
          expect(c).not.toEqual(ca);
          expect(ca2).toEqual(c);
          service.getActiveCollection().then((ca3: Collection) => {
            expect(c).toEqual(ca3);
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

});
