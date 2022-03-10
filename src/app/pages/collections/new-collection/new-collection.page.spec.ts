import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {AlertController, IonicModule, NavController} from '@ionic/angular';
import {NewCollectionPage} from './new-collection.page';
import {ReactiveFormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CollectionService} from '../../../services/collection/collection.service';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';
import {Collection} from '../../../classes/collection/collection';
import {MockAlertController, MockNavController} from '../../../../mocks';
import {AbstractStorageService} from '../../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../../services/storage/mock-storage.service';

describe('NewCollectionPage for creation', () => {
  let component: NewCollectionPage;
  let fixture: ComponentFixture<NewCollectionPage>;
  let service: CollectionService;

  let mockActivatedRoute;

  beforeEach(waitForAsync(() => {
    mockActivatedRoute = {snapshot: {queryParamMap: {get: () => undefined}}};
    TestBed.configureTestingModule({
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: NavController, useClass: MockNavController},
      ],
      declarations: [NewCollectionPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NewCollectionPage);
    component = fixture.componentInstance;
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
        done();
      });
    });

  });
});

describe('NewCollectionPage for update', () => {
  let component: NewCollectionPage;
  let fixture: ComponentFixture<NewCollectionPage>;
  let service: CollectionService;

  let mockActivatedRoute;
  let mockInactiveCollection: Collection;

  beforeEach(waitForAsync(() => {
    mockActivatedRoute = {snapshot: {queryParamMap: {get: () => 1}}};

    TestBed.configureTestingModule({
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: NavController, useClass: MockNavController},
        {provide: AlertController, useClass: MockAlertController},
      ],
      declarations: [NewCollectionPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    service = TestBed.inject(CollectionService);
  }));

  beforeEach(waitForAsync(() => {
    mockInactiveCollection = {
      active: false,
      createdAt: new Date(2020, 1, 1).getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: {
        createdAt: new Date(2020, 1, 1).getTime(),
        icon: 'assets/img/emojis/fr.png',
        id: 1,
        name: 'French',
        prefix: 'FR',
        status: true,
        updatedAt: new Date(2020, 1, 2).getTime(),
      },
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date(2020, 1, 2).getTime(),
    };
    initializeCollections();
  }));

  const initializeCollections = (): Promise<void> => new Promise(res => {
    service.addCollection(mockInactiveCollection).then(() => {
      fixture = TestBed.createComponent(NewCollectionPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
      res();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit collection for update', (done) => {
    const navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'navigateBack');
    const previousDate = mockInactiveCollection.updatedAt;
    component.onSubmit().then(() => {
      service.getCollectionById(mockInactiveCollection.id).then(c => {
        expect(c.updatedAt).not.toBe(previousDate);
        expect(c.language).toEqual(mockInactiveCollection.language);
        expect(navCtrl.navigateBack).toHaveBeenCalledWith('collections');
        done();
      });
    });
  });

  it('should toggle mode if invalid ID provided', (done) => {
    mockActivatedRoute.snapshot.queryParamMap.get = () => 'sample';
    component.ngOnInit().then(() => {
      component.editingId = null;
      done();
    });
  });

  it('should display alert when deleting collection', (done) => {
    const alertController = fixture.debugElement.injector.get(AlertController);
    spyOn(alertController, 'create').and.callThrough();
    component.openDeletionAlert().then(() => {
      expect(alertController.create).toHaveBeenCalled();
      done();
    });
  });

});
