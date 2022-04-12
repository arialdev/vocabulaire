import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';

import {RouterTestingModule} from '@angular/router/testing';

import {AppComponent} from './app.component';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {MockStorageService} from './services/storage/mock-storage.service';
import {TranslateService} from '@ngx-translate/core';
import {MockTranslateService} from '../mocks';

describe('AppComponent', () => {


  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: TranslateService, useClass: MockTranslateService}
      ]
    }).compileComponents();
  }));

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should have menu labels', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.nativeElement;
    const menuItems = app.querySelectorAll('ion-label');
    expect(menuItems.length).toEqual(5);
    expect(menuItems[0].textContent).toContain('Home');
    expect(menuItems[1].textContent).toContain('Word of the Day');
  }));

  it('should have urls', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.nativeElement;
    const menuItems = app.querySelectorAll('ion-item');
    expect(menuItems.length).toEqual(5);
    expect(menuItems[0].getAttribute('ng-reflect-router-link')).toEqual('/home');
    expect(menuItems[1].getAttribute('ng-reflect-router-link')).toEqual('/word-of-the-day');
    expect(menuItems[4].getAttribute('ng-reflect-router-link')).toEqual('/settings');
  }));
});
