import {TestBed} from '@angular/core/testing';

import {TutorialGuard} from './tutorial.guard';
import {AbstractStorageService} from '../services/storage/abstract-storage-service';
import {MockStorageService} from '../services/storage/mock-storage.service';
import {NavController} from '@ionic/angular';

import {SettingsService} from '../services/settings/settings.service';
import {TranslateService} from '@ngx-translate/core';
import {MockTranslateService} from '../../mocks';
import {RouterTestingModule} from '@angular/router/testing';

describe('TutorialGuard', () => {
  let guard: TutorialGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: TranslateService, useClass: MockTranslateService}
      ]
    });
    guard = TestBed.inject(TutorialGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

describe('TutorialGuard (isolated)', () => {
  const routeMock: any = {snapshot: {}};
  const routeStateMock: any = {snapshot: {}, url: '/home'};

  let guard: TutorialGuard;
  let routerSpy: jasmine.SpyObj<NavController>;
  let serviceStub: Partial<SettingsService>;

  describe('The app has not been initialized yet', () => {
    beforeEach(() => {
      routerSpy = jasmine.createSpyObj<NavController>('NavController', ['navigateRoot']);
      serviceStub = {
        isInitialized: () => Promise.resolve(false),
      };
      guard = new TutorialGuard(serviceStub as SettingsService, routerSpy);
    });
    it('rejects access when trying to access home', async () => {
      routeStateMock.url = '/home';
      const isAccessGranted = await guard.canActivate(routeMock, routeStateMock);
      expect(isAccessGranted).toBeFalse();
      expect(routerSpy.navigateRoot).toHaveBeenCalledWith('/tutorial');
    });

    it('grants access when trying to access tutorial', async () => {
      routeStateMock.url = '/tutorial';
      await expectAsync(guard.canActivate(routeMock, routeStateMock)).toBeResolvedTo(true);
    });
  });

  describe('The app has already been initialized', () => {
    beforeEach(() => {
      routerSpy = jasmine.createSpyObj<NavController>('NavController', ['navigateRoot']);
      serviceStub = {
        isInitialized: () => Promise.resolve(true),
      };
      guard = new TutorialGuard(serviceStub as SettingsService, routerSpy);
    });

    it('grants access when trying to access home', async () => {
      routeStateMock.url = '/home';
      await expectAsync(guard.canActivate(routeMock, routeStateMock)).toBeResolvedTo(true);
    });

    it('rejects access when trying to access tutorial', async () => {
      routeStateMock.url = '/tutorial';
      const isAccessGranted = await guard.canActivate(routeMock, routeStateMock);
      expect(isAccessGranted).toBeFalse();
      expect(routerSpy.navigateRoot).toHaveBeenCalledWith('/');
    });
  });
});
