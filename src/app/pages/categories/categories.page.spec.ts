import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {CategoriesPage} from './categories.page';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {CollectionService} from '../../services/collection/collection.service';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {Category} from '../../classes/category/category';
import {CategoryService} from '../../services/category/category.service';
import {CategoryType} from '../../enums/enums';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MockTranslatePipe, MockTranslateService} from '../../../mocks';

describe('CategoriesPage', () => {
  let component: CategoriesPage;
  let fixture: ComponentFixture<CategoriesPage>;
  let mockActivatedRoute: any;

  let collectionService: CollectionService;
  let categoryService: CategoryService;
  let collection: Collection;
  let gramaticalCategory: Category;
  let thematicCategory: Category;

  beforeEach(waitForAsync(() => {
    mockActivatedRoute = {snapshot: {params: {type: 0}}};
    TestBed.configureTestingModule({
      declarations: [CategoriesPage, MockTranslatePipe],
      imports: [IonicModule.forRoot(), RouterTestingModule.withRoutes([])],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: TranslateService, useClass: MockTranslateService}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    collectionService = TestBed.inject(CollectionService);
    categoryService = TestBed.inject(CategoryService);
  }));

  beforeEach(waitForAsync(() => {
    collection = new Collection('English', 'EN', new Emoji('flags', 'uk'));
    gramaticalCategory = new Category('Verb', CategoryType.gramatical);
    thematicCategory = new Category('Body', CategoryType.thematic);
    initialize();
  }));

  const initialize = (): Promise<void> => new Promise(res => {
    collectionService.addCollection(collection).then((c) => {
      collectionService.setActiveCollection(c.getId()).then(cActive => {
        categoryService.addCategory(gramaticalCategory, cActive.getId()).then(() => {
          categoryService.addCategory(thematicCategory, cActive.getId()).then(() => {
            collection = cActive;
            fixture = TestBed.createComponent(CategoriesPage);
            component = fixture.componentInstance;
            fixture.detectChanges();
            res();
          });
        });
      });
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create alert', async () => {
    await expectAsync(component.newCategory()).toBeResolvedTo();
    await expectAsync(component.editCategory(new Category('body', undefined))).toBeResolvedTo();
  });

  it('should delete gramatical category', async () => {
    expect(component.categories).toEqual([gramaticalCategory]);
    await component.deleteCategory(gramaticalCategory);
    expect(component.categories).toEqual([]);
  });

  it('should delete thematic category', async () => {
    fixture.debugElement.injector.get(ActivatedRoute).snapshot.params.type = 1;
    fixture.detectChanges();
    await component.ngOnInit();
    await component.deleteCategory(thematicCategory);
    expect(component.categories).toEqual([]);
  });
});
