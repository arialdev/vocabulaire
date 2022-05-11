import {TestBed} from '@angular/core/testing';

import {CreateTagGuard} from './create-tag.guard';
import {AbstractStorageService} from '../services/storage/abstract-storage-service';
import {MockStorageService} from '../services/storage/mock-storage.service';
import {NavController} from '@ionic/angular';
import {MockNavController} from '../../mocks';
import {CollectionService} from '../services/collection/collection.service';
import {TagService} from '../services/tag/tag.service';
import {Collection} from '../classes/collection/collection';
import {Tag} from '../classes/tag/tag';
import {TagOptions} from '../classes/tagOptions/tag-options';
import {Emoji} from '../classes/emoji/emoji';

describe('CreateTagGuard', () => {
  let guard: CreateTagGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: NavController, useClass: MockNavController},
      ]
    });
    guard = TestBed.inject(CreateTagGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

describe('CreateTagGuard (isolated)', () => {
  const routeMock: any = {snapshot: {}};
  const routeStateMock: any = {snapshot: {}, url: '/home'};

  let guard: CreateTagGuard;
  let routerSpy: jasmine.SpyObj<NavController>;
  let serviceStub: Partial<CollectionService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj<NavController>('NavController', ['navigateBack']);
  });

  describe('Higher tags bound not reached yet', () => {
    beforeEach(() => {
      serviceStub = {
        getActiveCollection: () => Promise.resolve(new Collection('a', 'b', undefined)),
      };
      guard = new CreateTagGuard(serviceStub as CollectionService, routerSpy);
    });

    it('grants access when trying to access home', async () => {
      routeStateMock.url = '/home';
      expect(guard.canActivate(routeMock, routeStateMock)).toBeTrue();
    });

    it('grants access when trying to access newTag page', async () => {
      routeStateMock.url = '/tag/new';
      await expectAsync(guard.canActivate(routeMock, routeStateMock)).toBeResolvedTo(true);
    });
  });

  describe('Higher tags bound has already reached', () => {
    beforeEach(() => {
      const collection = new Collection('a', 'b', undefined);
      for (let i = 0; i < TagService.maxTagsBound; i++) {
        collection.addTag(new Tag('', new Emoji('', ''), new TagOptions('')));
      }
      serviceStub = {
        getActiveCollection: () => Promise.resolve(collection),
      };
      guard = new CreateTagGuard(serviceStub as CollectionService, routerSpy);
    });

    it('grants access when trying to access home', async () => {
      routeStateMock.url = '/home';
      expect(guard.canActivate(routeMock, routeStateMock)).toBeTrue();
    });

    it('rejects access when trying to access newTag page', async () => {
      routeStateMock.url = '/tag/new';
      const isAccessGranted = await guard.canActivate(routeMock, routeStateMock);
      expect(isAccessGranted).toBeFalse();
      expect(routerSpy.navigateBack).toHaveBeenCalledWith('/');
    });
  });
});
