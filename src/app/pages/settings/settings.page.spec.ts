import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule, MenuController} from '@ionic/angular';

import {SettingsPage} from './settings.page';
import {MockMenuController} from '../../../mocks';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {RouterTestingModule} from '@angular/router/testing';

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
});
