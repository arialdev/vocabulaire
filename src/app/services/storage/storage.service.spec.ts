import {TestBed} from '@angular/core/testing';

import {StorageService} from './storage.service';
import {Drivers} from '@ionic/storage';
import {IonicStorageModule} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot({
        // eslint-disable-next-line no-underscore-dangle
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
      }),],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should get existing value', (done) => {
    service.get('settings').then(s => {
      expect(s).toEqual({darkMode: false, preferredLanguage: {prefix: 'en', name: 'English'}});
      done();
    });
  });

  it('should not get non existing vale', (done) => {
    service.get('null').then(item => {
      expect(item).toBeFalsy();
      done();
    });
  });

  it('should set new value', (done) => {
    service.set('key', 'value').then(res => {
      expect(res).toEqual('value');
      service.get('key').then(item => {
        expect(item).toEqual('value');
        done();
      });
    });
  });

  it('should remove existing element', (done) => {
    service.remove('sample').then(() => {
      service.get('sample').then(e => {
        expect(e).toBeNull();
        done();
      });
    });
  });
});
