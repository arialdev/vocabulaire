import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CollectionsPage} from './collections.page';
import {CollectionService} from '../../services/collection/collection.service';
import {StorageService} from '../../services/storage/storage.service';
import {By} from '@angular/platform-browser';
import {IonicStorageModule} from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {Drivers} from '@ionic/storage';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {Collection} from '../../interfaces/collection';
import {Language} from '../../interfaces/language';

const mockLanguage1: Language = {
  createdAt: new Date().getTime(),
  icon: 'assets/img/emojis/uk.png',
  id: 1,
  name: 'English',
  prefix: 'EN',
  status: true,
  updatedAt: new Date().getTime(),
};
const mockLanguage2: Language = {
  createdAt: new Date().getTime(),
  icon: 'assets/img/emojis/fr.png',
  id: 1,
  name: 'French',
  prefix: 'FR',
  status: true,
  updatedAt: new Date().getTime(),
};
const mockActiveCollection: Collection = {
  active: true,
  createdAt: new Date().getTime(),
  gramaticalCategories: undefined,
  id: undefined,
  language: mockLanguage1,
  status: true,
  tags: [],
  terms: [],
  thematicCategories: [],
  updatedAt: new Date().getTime(),
};
const mockInactiveCollection: Collection = {
  active: false,
  createdAt: new Date().getTime(),
  gramaticalCategories: undefined,
  id: undefined,
  language: mockLanguage2,
  status: true,
  tags: [],
  terms: [],
  thematicCategories: [],
  updatedAt: new Date().getTime(),
};

describe('CollectionsPage', () => {
  let component: CollectionsPage;
  let fixture: ComponentFixture<CollectionsPage>;
  let storage: StorageService;
  let service: CollectionService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionsPage],
      imports: [IonicStorageModule.forRoot({
        // eslint-disable-next-line no-underscore-dangle
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
      }), RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsPage);
    component = fixture.componentInstance;
    storage = TestBed.inject(StorageService);
    service = TestBed.inject(CollectionService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contains back button', () => {
    const backButton = fixture.debugElement.query(By.css('ion-header ion-back-button'));
    expect(backButton).toBeTruthy();
    expect(backButton.attributes.defaultHref).toEqual('home');
  });

  it('should list collections', () => {
    expect(component.collections.length).toBe(0);
    expect(fixture.debugElement.query(By.css('collections-list'))).toBeNull();
    component.collections = [mockInactiveCollection, mockActiveCollection];
    fixture.detectChanges();
    expect(component.collections.length).toBe(2);
    const list = fixture.debugElement.query(By.css('.collections-list'));
    expect(list).toBeTruthy();
    expect(list.queryAll(By.css('.collection')).length).toBe(2);
    expect(list.queryAll(By.css('.collection>.collection-active')).length).toBe(1);

    const docCollection = list.query(By.css('.collection-active'));
    expect(docCollection.query(By.css('.collection-icon')).nativeElement.src).toBe(mockActiveCollection.language.icon);
    expect(docCollection.query(By.css('.language-prefix')).nativeElement.innerText).toBe(mockActiveCollection.language.prefix);
    expect(docCollection.query(By.css('.collection-name')).nativeElement.innerText).toBe(mockActiveCollection.language.name);
  });

  it('set active', async () => {
    await service.addCollection(mockActiveCollection);
    await service.addCollection(mockInactiveCollection);
    await component.ngOnInit();
    await component.setActive(mockInactiveCollection.id);
    const actives = component.collections.filter(c => c.active);
    expect(actives.length).toBe(1);
    expect(actives[0].id).toBe(mockInactiveCollection.id);
  });
});
