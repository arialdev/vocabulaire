import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {TermPage} from './term.page';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {CategoriesPage} from '../categories/categories.page';
import {CollectionService} from '../../services/collection/collection.service';
import {RouterTestingModule} from '@angular/router/testing';
import {Category} from '../../classes/category/category';

describe('TermPage', () => {
  let component: TermPage;
  let fixture: ComponentFixture<TermPage>;

  let collection: Collection;
  let collectionService: CollectionService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TermPage],
      imports: [IonicModule.forRoot(), RouterTestingModule.withRoutes([])],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
      ]
    }).compileComponents();

    collectionService = TestBed.inject(CollectionService);
  }));

  beforeEach(waitForAsync(() => {
    collection = new Collection('English', 'EN', new Emoji('flags', 'uk'));
    initialize();
  }));

  const initialize = (): Promise<void> => new Promise(res => {
    collectionService.addCollection(collection).then((c) => {
      collectionService.setActiveCollection(c.getId()).then(cActive => {
        collection = cActive;
        fixture = TestBed.createComponent(TermPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
        res();
      });
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update category chips', () => {
    const value1 = [new Category('Body', undefined), new Category('Family', undefined)];
    const value2 = [new Category('Family', undefined), new Category('Body', undefined)];
    component.updateChips(new CustomEvent<any>('', {detail: {value: value1}}), 0);
    component.updateChips(new CustomEvent<any>('', {detail: {value: value2}}), 1);
    expect(component.selectedGramaticalCategories).toEqual(value1);
    expect(component.selectedThematicCategories).toEqual(value2);
  });
});
