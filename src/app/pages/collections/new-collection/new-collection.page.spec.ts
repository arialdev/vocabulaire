import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule, NavController} from '@ionic/angular';

import {NewCollectionPage} from './new-collection.page';
import {ReactiveFormsModule} from '@angular/forms';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {Drivers} from '@ionic/storage';
import {IonicStorageModule} from '@ionic/storage-angular';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {StorageService} from '../../../services/storage/storage.service';
import {CollectionService} from '../../../services/collection/collection.service';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {Collection} from '../../../interfaces/collection';
import {NavMock} from '../../../../mocks';

describe('NewCollectionPage', () => {
  let component: NewCollectionPage;
  let fixture: ComponentFixture<NewCollectionPage>;
  let storage: StorageService;
  let service: CollectionService;
  let routerSpy;

  beforeEach(waitForAsync(() => {
    routerSpy = {navigate: jasmine.createSpy('navigate')};
    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: routerSpy},
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => undefined,
              },
            },
          },
        },
        {
          provide: NavController,
          useClass: NavMock,
        },
      ],
      declarations: [NewCollectionPage],
      imports: [IonicModule.forRoot(), IonicStorageModule.forRoot({
        // eslint-disable-next-line no-underscore-dangle
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
      }), ReactiveFormsModule, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NewCollectionPage);
    component = fixture.componentInstance;
    storage = TestBed.inject(StorageService);
    service = TestBed.inject(CollectionService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select emoji', () => {
    component.selectEmoji('sample');
    expect(component.selectedEmoji).toBe('sample');
    expect(component.modalStatus).toBeFalse();
  });

  it('should select undefined emoji', () => {
    component.selectEmoji(undefined);
    expect(component.selectedEmoji).not.toBeUndefined();
  });

  it('should toggle modal', () => {
    const previousValue = component.modalStatus;
    component.toggleModal();
    expect(component.modalStatus === previousValue).toBeFalse();
  });

  it('should submit collection', (done) => {
    const newValues = {
      name: 'Sample',
      prefix: 'SL',
      icon: 'assets/img/emojis/people/smile.png',
    };

    const navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'navigateBack');

    component.collectionForm.patchValue(newValues);
    component.onSubmit().then(() => {
      service.getCollections().then((cs: Collection[]) => {
        const collection = cs.find(c =>
          c.language.name === newValues.name &&
          c.language.prefix === newValues.prefix &&
          c.language.icon === newValues.icon
        );
        expect(collection).toBeTruthy();
        expect(navCtrl.navigateBack).toHaveBeenCalledWith('collections');
        // expect(routerSpy.navigate.calls.first().args[0]).toContain('collections');
        done();
      });
    });

  });

});
