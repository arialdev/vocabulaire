import {TestBed} from '@angular/core/testing';

import {SettingsService} from './settings.service';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {MockStorageService} from '../storage/mock-storage.service';

describe('ThemeService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: AbstractStorageService, useClass: MockStorageService}]
    });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
