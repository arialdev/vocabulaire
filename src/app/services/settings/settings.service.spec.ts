import {TestBed} from '@angular/core/testing';

import {SettingsService} from './settings.service';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {MockStorageService} from '../storage/mock-storage.service';
import {TranslateService} from '@ngx-translate/core';
import {MockTranslateService} from '../../../mocks';
import {GuiLanguage} from '../../interfaces/gui-language';

describe('ThemeService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: TranslateService, useClass: MockTranslateService}
      ]
    });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get darkMode status', async () => {
    await expectAsync(service.isDarkMode()).toBeResolvedTo(false);
  });

  it('should get preferred language', async () => {
    await expectAsync(service.getPreferredLanguage()).toBeResolvedTo({prefix: 'en', name: 'English'});
  });

  it('should get all languages', () => {
    expect(service.getLanguages().length).toBe(4);
  });

  it('should toggle dark mode', async () => {
    spyOn(document.body, 'setAttribute');
    await service.toggleTheme();
    expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    await service.toggleTheme();
    expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });

  it('should set valid language', async () => {
    const lang: GuiLanguage = {prefix: 'fr', name: 'Français'};
    const translateService = TestBed.inject(TranslateService);
    const storageService = TestBed.inject(AbstractStorageService);
    spyOn(translateService, 'use');
    spyOn(storageService, 'set');
    await service.setLanguage(lang);
    expect(translateService.use).toHaveBeenCalledWith(lang.prefix);
    expect(storageService.set).toHaveBeenCalled();
  });
});
