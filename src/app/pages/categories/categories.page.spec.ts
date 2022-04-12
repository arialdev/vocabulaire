import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule, MenuController} from '@ionic/angular';

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
import {MockMenuController, MockTranslatePipe, MockTranslateService} from '../../../mocks';

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
        {provide: TranslateService, useClass: MockTranslateService},
        {provide: MenuController, useClass: MockMenuController}
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

  it('should create alert for gramatical category', async () => {
    await expectAsync(component.newCategory()).toBeResolvedTo();
    await expectAsync(component.editCategory(new Category('body', undefined))).toBeResolvedTo();
  });

  it('should create alert for gramatical category', async () => {
    fixture.debugElement.injector.get(ActivatedRoute).snapshot.params.type = 1;
    fixture.detectChanges();
    await component.ngOnInit();
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

  it('should filter searchbar', async () => {
    const gc1 = new Category('be', CategoryType.gramatical);
    let gc2 = new Category('cá', CategoryType.gramatical);
    let gc3 = new Category('aá', CategoryType.gramatical);
    let tc1 = new Category('by', CategoryType.thematic);
    const tc2 = new Category('cá', CategoryType.thematic);
    const tc3 = new Category('aá', CategoryType.thematic);
    await categoryService.addCategory(gc1, collection.getId());
    gc2 = await categoryService.addCategory(gc2, collection.getId());
    gc3 = await categoryService.addCategory(gc3, collection.getId());
    tc1 = await categoryService.addCategory(tc1, collection.getId());
    await categoryService.addCategory(tc2, collection.getId());
    await categoryService.addCategory(tc3, collection.getId());
    fixture.detectChanges();
    await component.ngOnInit();
    let event = {target: {value: 'á'}};
    component.handleSearchbar(event);
    expect(component.categories).toEqual([gc2, gc3]);

    fixture.debugElement.injector.get(ActivatedRoute).snapshot.params.type = 1;
    fixture.detectChanges();
    await component.ngOnInit();
    event = {target: {value: 'y'}};
    component.handleSearchbar(event);
    expect(component.categories).toEqual([thematicCategory, tc1]);
  });
});
