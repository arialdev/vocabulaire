import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {AlertController, IonicModule, NavController} from '@ionic/angular';
import {NewCollectionPage} from './new-collection.page';
import {ReactiveFormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CollectionService} from '../../../services/collection/collection.service';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';
import {Collection} from '../../../classes/collection/collection';
import {MockAlertController, MockNavController, MockTranslateService} from '../../../../mocks';
import {AbstractStorageService} from '../../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../../services/storage/mock-storage.service';
import {Emoji} from '../../../classes/emoji/emoji';
import {EmojisMap} from '../../../services/emoji/emojisMap';
import isEqual from 'lodash.isequal';
import {TranslateService} from '@ngx-translate/core';
import {EmojiPipeModule} from '../../../pipes/emoji-pipe/emoji-pipe.module';

describe('NewCollectionPage for creation', () => {
  let component: NewCollectionPage;
  let fixture: ComponentFixture<NewCollectionPage>;
  let service: CollectionService;

  let mockActivatedRoute;
  let emoji: Emoji;

  beforeEach(waitForAsync(() => {
    emoji = new Emoji('2_smile.png', '1_people');
    mockActivatedRoute = {snapshot: {paramMap: {get: () => undefined}}};
    TestBed.configureTestingModule({
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: NavController, useClass: MockNavController},
        {provide: EmojisMap},
        {provide: TranslateService, useClass: MockTranslateService}
      ],
      declarations: [NewCollectionPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, RouterTestingModule, EmojiPipeModule],
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
    component.selectEmoji(emoji);
    expect(component.selectedEmoji).toEqual(emoji);
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
      icon: emoji,
    };

    const navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'navigateBack');
    spyOn(service, 'setActiveCollection');

    component.collectionForm.patchValue(newValues);
    component.onSubmit().then(() => {
      service.getCollections().then((cs: Collection[]) => {
        const collection = cs.find(c =>
          c.getLanguage().getName() === newValues.name &&
          c.getLanguage().getPrefix() === newValues.prefix &&
          isEqual(c.getLanguage().getIcon(), newValues.icon)
        );
        expect(collection).toBeTruthy();
        expect(service.setActiveCollection).toHaveBeenCalled();
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
    mockActivatedRoute = {snapshot: {paramMap: {get: () => 1}}};

    TestBed.configureTestingModule({
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: NavController, useClass: MockNavController},
        {provide: AlertController, useClass: MockAlertController},
        {provide: EmojisMap},
        {provide: TranslateService, useClass: MockTranslateService},
      ],
      declarations: [NewCollectionPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, RouterTestingModule, EmojiPipeModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    service = TestBed.inject(CollectionService);
  }));

  beforeEach(waitForAsync(() => {
    mockInactiveCollection = new Collection('French', 'FR', new Emoji('1645_fr.png', '8_flags'));
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
    spyOn(Collection.prototype, 'updateUpdatedTime');
    component.onSubmit().then(() => {
      service.getCollectionById(mockInactiveCollection.getId()).then(c => {
        expect(c.updateUpdatedTime).toHaveBeenCalled();
        expect(navCtrl.navigateBack).toHaveBeenCalledWith('collections');
        done();
      });
    });
  });

  it('should toggle mode if invalid ID provided', (done) => {
    mockActivatedRoute.snapshot.paramMap.get = () => 'sample';
    component.ngOnInit().then(() => {
      expect(component.editingId).toBeNull();
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
