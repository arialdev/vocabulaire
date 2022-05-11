import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {MockStorageService} from './services/storage/mock-storage.service';
import {TranslateService} from '@ngx-translate/core';
import {MockTranslateService} from '../mocks';
import {ScreenOrientation} from '@awesome-cordova-plugins/screen-orientation/ngx';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: TranslateService, useClass: MockTranslateService},
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {provide: ScreenOrientation, useValue: {lock: () => Promise.resolve(), ORIENTATIONS: {PORTRAIT: 1}}}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create the app', waitForAsync(() => {
    expect(app).toBeTruthy();
  }));
});
