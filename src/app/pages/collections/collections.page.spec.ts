import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CollectionsPage} from './collections.page';
import {CollectionService} from '../../services/collection/collection.service';
import {By} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Collection} from '../../classes/collection/collection';
import {Language} from '../../classes/language/language';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {ActivatedRoute, Router} from '@angular/router';

describe('CollectionsPage', () => {
  let mockLanguage1: Language;
  let mockLanguage2: Language;
  let mockActiveCollection: Collection;
  let mockInactiveCollection: Collection;

  let component: CollectionsPage;
  let fixture: ComponentFixture<CollectionsPage>;
  let service: CollectionService;
  let routerSpy;
  let mockActivatedRoute;

  beforeEach(waitForAsync(() => {
    routerSpy = {navigate: jasmine.createSpy('navigate')};
    mockActivatedRoute = {snapshot: {queryParamMap: {get: () => 'collections'}}};

    TestBed.configureTestingModule({
      declarations: [CollectionsPage],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: Router, useValue: routerSpy},
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsPage);
    component = fixture.componentInstance;
    service = TestBed.inject(CollectionService);
    fixture.detectChanges();
  }));

  beforeEach(() => {
    mockLanguage1 = {
      createdAt: new Date(2020, 1, 1).getTime(),
      icon: 'assets/img/emojis/uk.png',
      id: 1,
      name: 'English',
      prefix: 'EN',
      status: true,
      updatedAt: new Date(2020, 1, 2).getTime(),
    };

    mockLanguage2 = {
      createdAt: new Date(2020, 1, 1).getTime(),
      icon: 'assets/img/emojis/fr.png',
      id: 1,
      name: 'French',
      prefix: 'FR',
      status: true,
      updatedAt: new Date(2020, 1, 2).getTime(),
    };

    mockActiveCollection = {
      active: true,
      createdAt: new Date(2020, 1, 1).getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: mockLanguage1,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date(2020, 1, 2).getTime(),
    };
    mockInactiveCollection = {
      active: false,
      createdAt: new Date(2020, 1, 1).getTime(),
      gramaticalCategories: undefined,
      id: undefined,
      language: mockLanguage2,
      status: true,
      tags: [],
      terms: [],
      thematicCategories: [],
      updatedAt: new Date(2020, 1, 2).getTime(),
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contains back button', () => {
    const backButton = fixture.debugElement.query(By.css('ion-header .back-button'));
    expect(backButton).toBeTruthy();
    expect(backButton.attributes.href).toEqual('/home');
  });

  // it('should list collections', () => {
  //   expect(component.collections.length).toBe(0);
  //   expect(fixture.debugElement.query(By.css('collections-list'))).toBeNull();
  //   component.collections = [mockInactiveCollection, mockActiveCollection];
  //   fixture.detectChanges();
  //   expect(component.collections.length).toBe(2);
  //   const list = fixture.debugElement.query(By.css('.collections-list'));
  //   expect(list).toBeTruthy();
  //   expect(list.queryAll(By.css('.collection')).length).toBe(2);
  //   expect(list.queryAll(By.css('.collection>.collection-active')).length).toBe(1);
  //
  //   const docCollection = list.query(By.css('.collection-active'));
  //   expect(docCollection.query(By.css('.collection-icon')).nativeElement.src).toBe(mockActiveCollection.language.icon);
  //   expect(docCollection.query(By.css('.language-prefix')).nativeElement.innerText).toBe(mockActiveCollection.language.prefix);
  //   expect(docCollection.query(By.css('.collection-name')).nativeElement.innerText).toBe(mockActiveCollection.language.name);
  // });

  it('should set collection active', async () => {
    await service.addCollection(mockActiveCollection);
    await service.addCollection(mockInactiveCollection);
    await component.ionViewWillEnter();
    await component.setActive(mockInactiveCollection.id);
    const actives = component.collections.filter(c => c.active && c.status);
    expect(actives.length).toBe(1);
    expect(actives[0].id).toBe(mockInactiveCollection.id);
  });

  it('should toggle managing/setting mode', () => {
    const previousState = component.managingMode;
    component.toggleManage();
    expect(component.managingMode).not.toBe(previousState);
    component.toggleManage();
    expect(component.managingMode).toBe(previousState);
  });

  it('should click item and navigate to its sheet when managing mode', (done) => {
    component.managingMode = true;
    mockInactiveCollection.id = 1;
    component.collections = [mockInactiveCollection];
    fixture.detectChanges();

    component.onItemClick(mockInactiveCollection.id).then(() => {
      expect(routerSpy.navigate.calls.first().args[0]).toContain('new');
      done();
    });
  });

  it('should click item and set it active when setting mode', (done) => {
    component.managingMode = false;
    mockInactiveCollection.id = 1;
    component.collections = [mockInactiveCollection];
    fixture.detectChanges();
    const spy = spyOn(component, 'setActive');

    component.onItemClick(mockInactiveCollection.id).then(() => {
      expect(spy).toHaveBeenCalledWith(mockInactiveCollection.id);
      done();
    });
  });

  it('should sort collections', (done) => {
    component.managingMode = true;
    service.addCollection(mockInactiveCollection).then(cInactive => {
      service.addCollection(mockActiveCollection).then(cActive1 => {
        service.addCollection({...mockInactiveCollection}).then(cInactive2 => {
          service.addCollection({...mockInactiveCollection}).then(cInactive3 => {
            component.ionViewWillEnter().then(() => {
              expect(component.collections.map(c => c.id)).toEqual([cActive1.id, cInactive.id, cInactive2.id, cInactive3.id]);
              done();
            });
          });
        });
      });
    });
  });
});
