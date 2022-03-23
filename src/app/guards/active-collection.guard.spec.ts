import {TestBed} from '@angular/core/testing';

import {ActiveCollectionGuard} from './active-collection.guard';
import {AbstractStorageService} from '../services/storage/abstract-storage-service';
import {MockStorageService} from '../services/storage/mock-storage.service';
import {RouterTestingModule} from '@angular/router/testing';

describe('ActiveCollectionGuard', () => {
  let guard: ActiveCollectionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
      ]
    });
    guard = TestBed.inject(ActiveCollectionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
