import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule, ToastController} from '@ionic/angular';

import {SettingsPage} from './settings.page';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {RouterTestingModule} from '@angular/router/testing';
import {SettingsService} from '../../services/settings/settings.service';
import {TranslateService} from '@ngx-translate/core';
import {MockToastController, MockTranslateService} from '../../../mocks';
import {GuiLanguage} from '../../interfaces/gui-language';
import {FormsModule} from '@angular/forms';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPage],
      imports: [IonicModule.forRoot(), RouterTestingModule.withRoutes([]), FormsModule],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: TranslateService, useClass: MockTranslateService},
        {provide: ToastController, useClass: MockToastController}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle theme', async () => {
    const settingsService = fixture.debugElement.injector.get(SettingsService);
    spyOn(settingsService, 'toggleTheme');

    await component.toggleTheme({detail: {checked: true}});
    expect(settingsService.toggleTheme).toHaveBeenCalled();

    spyOn(settingsService, 'isDarkMode').and.callFake(() => Promise.resolve(true));
    await component.toggleTheme({detail: {checked: true}});
    expect(settingsService.toggleTheme).not.toHaveBeenCalledTimes(2);
  });

  it('should load main language when preferred on is corrupted', async () => {
    const settingsService = fixture.debugElement.injector.get(SettingsService);
    spyOn(settingsService, 'getPreferredLanguage').and.callFake(() => Promise.resolve(undefined));
    await component.ngOnInit();
    expect(component.preferredLanguage.prefix).toEqual('en');
  });

  it('should changeLanguage', () => {
    const settingsService = fixture.debugElement.injector.get(SettingsService);
    spyOn(settingsService, 'setLanguage');
    const lang: GuiLanguage = {prefix: 'fr', name: 'French'};
    component.changeLanguage({detail: {value: lang}});
    expect(settingsService.setLanguage).toHaveBeenCalledWith(lang);
  });

  it('should open file explorer', () => {
    const button = document.getElementById('file-importer');
    spyOn(button, 'click');
    component.openFileExplorer();
    expect(button.click).toHaveBeenCalled();
  });

  it('should export data', () => {
    const storageService = fixture.debugElement.injector.get(AbstractStorageService);
    spyOn(storageService, 'exportData');
    component.exportData();
    expect(storageService.exportData).toHaveBeenCalled();
  });

  it('should import data', async () => {
    const storageService = fixture.debugElement.injector.get(AbstractStorageService);
    const toastController = TestBed.inject(ToastController);
    spyOn(storageService, 'importData').and.resolveTo(true);
    spyOn(toastController, 'create').and.callThrough();
    await component.importData({target: {files: []}});
    expect(storageService.importData).toHaveBeenCalledWith(undefined);
    await component.importData({target: {files: []}});
    expect(storageService.importData).toHaveBeenCalledTimes(2);
    expect(toastController.create).toHaveBeenCalledWith({
      message: 'sample',
      color: 'success',
      icon: 'download-outline',
      duration: 800
    });
  });

  it('should fail when trying to import data', async () => {
    const toastController = TestBed.inject(ToastController);
    spyOn(toastController, 'create').and.callThrough();
    const storageService = fixture.debugElement.injector.get(AbstractStorageService);
    spyOn(storageService, 'importData').and.rejectWith({message: 'Import has failed'});
    await component.importData({target: {files: []}});
    expect(storageService.importData).toHaveBeenCalledWith(undefined);
    expect(toastController.create).toHaveBeenCalledWith({
      header: 'sample',
      message: 'sample',
      color: 'danger',
      icon: 'download',
      duration: 1000
    });
  });

  it('should compare languages', () => {
    const lan1: GuiLanguage = {prefix: 'it', name: 'Italiano'};
    const lan2: GuiLanguage = {prefix: 'cn', name: 'Chinese'};
    component.languages = [lan1, lan2];
    expect(component.compareWith(lan1, lan2)).toBeFalse();
    expect(component.compareWith(lan1, lan1)).toBeTrue();
  });
});
