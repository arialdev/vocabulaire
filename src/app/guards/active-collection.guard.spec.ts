import {TestBed, waitForAsync} from '@angular/core/testing';

import {ActiveCollectionGuard} from './active-collection.guard';
import {AbstractStorageService} from '../services/storage/abstract-storage-service';
import {MockStorageService} from '../services/storage/mock-storage.service';
import {RouterTestingModule} from '@angular/router/testing';
import {CollectionService} from '../services/collection/collection.service';
import {NavController} from '@ionic/angular';
import {Collection} from '../classes/collection/collection';
import {Emoji} from '../classes/emoji/emoji';

describe('ActiveCollectionGuard', () => {
  let guard: ActiveCollectionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
      ]
    });
    guard = TestBed.inject(ActiveCollectionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

describe('ActiveCollectionGuard (isolated)', () => {
  let collections: Collection[];
  const routeMock: any = {snapshot: {}};
  const routeStateMock: any = {snapshot: {}, url: '/'};

  beforeEach(() => {
    collections = [];
    routerSpy = jasmine.createSpyObj<NavController>('NavController', ['navigateForward']);
    serviceStub = {
      addCollection: c => {
        c.setId(1);
        collections.push(c);
        return Promise.resolve(c);
      },
      getActiveCollection: () => {
        if (collections[0]) {
          return Promise.resolve(collections.find(c => c.isActive()));
        } else {
          return Promise.reject();
        }
      },
      setActiveCollection: (id) => {
        let cA;
        collections.forEach(c => {
            if (c.getId() === id) {
              c.setActive();
              cA = c;
            }
          }
        );
        return Promise.resolve(cA);
      }
    };
    guard = new ActiveCollectionGuard(serviceStub as CollectionService, routerSpy);
  });

  const fakeUrls = ['/'];
  let guard: ActiveCollectionGuard;
  let routerSpy: jasmine.SpyObj<NavController>;
  let serviceStub: Partial<CollectionService>;

  describe('when there is no active collection', () => {
    fakeUrls.forEach(fakeURL => {
      routeStateMock.url = fakeURL;
      it('rejects access', async () => {
        const isAccessGranted = await guard.canActivate(routeMock, routeStateMock);
        expect(isAccessGranted).toBeFalse();
        expect(routerSpy.navigateForward).toHaveBeenCalledWith('collections');
      });
    });
  });

  describe('when there is an active collection', async () => {
    beforeEach(waitForAsync(() => {
      serviceStub.addCollection(new Collection('English', 'EN', new Emoji('flags', 'uk')))
        .then(c => {
          serviceStub.setActiveCollection(c.getId());
        });
    }));

    fakeUrls.forEach(fakeURL => {
      routeStateMock.url = fakeURL;
      it('grants access', async () => {
        await expectAsync(guard.canActivate(undefined, undefined)).toBeResolvedTo(true);
      });
    });
  });
});
