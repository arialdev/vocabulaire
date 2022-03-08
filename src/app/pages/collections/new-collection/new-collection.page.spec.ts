import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule, NavController} from '@ionic/angular';
import {NewCollectionPage} from './new-collection.page';
import {ReactiveFormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CollectionService} from '../../../services/collection/collection.service';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';
import {Collection} from '../../../interfaces/collection';
import {NavMock} from '../../../../mocks';
import {AbstractStorageService} from '../../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../../services/storage/mock-storage.service';

describe('NewCollectionPage', () => {
  let component: NewCollectionPage;
  let fixture: ComponentFixture<NewCollectionPage>;
  let service: CollectionService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
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
        {provide: AbstractStorageService, useClass: MockStorageService},
        {
          provide: NavController,
          useClass: NavMock,
        },
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
