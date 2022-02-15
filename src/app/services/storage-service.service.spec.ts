import {TestBed} from '@angular/core/testing';

import {StorageServiceService} from './storage-service.service';

import {Storage} from '@ionic/storage';

describe('StorageServiceService', () => {
  let service: StorageServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const storage = new Storage();
    // service = TestBed.inject(StorageServiceService);
    service = new StorageServiceService(storage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
