import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {CollectionsPage} from './collections.page';
import {By} from '@angular/platform-browser';
import {HomePage} from '../home/home.page';
import {IonicStorageModule} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {Drivers} from '@ionic/storage';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';

describe('CollectionsPage', () => {
  let component: CollectionsPage;
  let fixture: ComponentFixture<CollectionsPage>;

  beforeEach(waitForAsync(() => {
    // TestBed.configureTestingModule({
    //   declarations: [CollectionsPage],
    //   imports: [IonicModule.forRoot()]
    // }).compileComponents();

    TestBed.configureTestingModule({
      declarations: [CollectionsPage],
      imports: [IonicStorageModule.forRoot({
        // eslint-disable-next-line no-underscore-dangle
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
      }), RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contains back button', () => {
    const backButton = fixture.debugElement.query(By.css('ion-header ion-back-button'));
    expect(backButton).toBeTruthy();
    expect(backButton.attributes.defaultHref).toEqual('home');
  });

  it('should contains title', () => {
    const element = fixture.debugElement.query(By.css('ion-header ion-title'));
    expect(element.nativeElement.innerText).toBe('Collections');
  });
});
