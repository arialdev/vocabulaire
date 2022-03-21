import {TestBed} from '@angular/core/testing';

import {MockStorageService} from './mock-storage.service';
import {AbstractStorageService} from './abstract-storage-service';

describe('MockStorageService', () => {
  let service: MockStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: AbstractStorageService, useClass: MockStorageService}],
    });
    service = TestBed.inject(MockStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should get existing value', (done) => {
    service.get('settings').then(s => {
      expect(s).toEqual({darkMode: false, language: 'en'});
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
