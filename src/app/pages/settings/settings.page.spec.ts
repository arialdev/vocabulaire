import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule, MenuController} from '@ionic/angular';

import {SettingsPage} from './settings.page';
import {MockMenuController} from '../../../mocks';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {RouterTestingModule} from '@angular/router/testing';
import {SettingsService} from '../../services/settings/settings.service';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPage],
      imports: [IonicModule.forRoot(), RouterTestingModule.withRoutes([])],
      providers: [
        {provide: MenuController, useClass: MockMenuController},
        {provide: AbstractStorageService, useClass: MockStorageService}
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
});
