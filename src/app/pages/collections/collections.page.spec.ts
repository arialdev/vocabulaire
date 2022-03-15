import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CollectionsPage} from './collections.page';
import {CollectionService} from '../../services/collection/collection.service';
import {By} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Collection} from '../../classes/collection/collection';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojisMap} from '../../services/emoji/emojisMap';

describe('CollectionsPage', () => {
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
        {provide: EmojisMap},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsPage);
    component = fixture.componentInstance;
    service = TestBed.inject(CollectionService);
    fixture.detectChanges();
  }));

  beforeEach(() => {
    mockActiveCollection = new Collection('English', 'EN', new Emoji('uk', 'flags'));
    mockActiveCollection.setActive();
    mockInactiveCollection = new Collection('French', 'FR', new Emoji('fr', 'flags'));
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
    await component.setActive(mockInactiveCollection.getId());
    const actives = component.collections.filter(c => c.isActive() && c.getStatus());
    expect(actives.length).toBe(1);
    expect(actives[0].getId()).toBe(mockInactiveCollection.getId());
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
    mockInactiveCollection.setId(1);
    component.collections = [mockInactiveCollection];
    fixture.detectChanges();

    component.onItemClick(mockInactiveCollection.getId()).then(() => {
      expect(routerSpy.navigate.calls.first().args[0]).toContain('new');
      done();
    });
  });

  it('should click item and set it active when setting mode', (done) => {
    component.managingMode = false;
    mockInactiveCollection.setId(1);
    component.collections = [mockInactiveCollection];
    fixture.detectChanges();
    const spy = spyOn(component, 'setActive');

    component.onItemClick(mockInactiveCollection.getId()).then(() => {
      expect(spy).toHaveBeenCalledWith(mockInactiveCollection.getId());
      done();
    });
  });

  it('should sort collections', (done) => {
    component.managingMode = true;
    service.addCollection(mockInactiveCollection).then(cInactive => {
      service.addCollection(mockActiveCollection).then(cActive1 => {
        service.addCollection(new Collection('Chinese', 'CN', new Emoji('cn', 'flags'))).then(cInactive2 => {
          service.addCollection(new Collection('Spanish', 'ES', new Emoji('es', 'flags'))).then(cInactive3 => {
            component.ionViewWillEnter().then(() => {
              expect(component.collections.map(c => c.getId())).toEqual([cActive1, cInactive, cInactive2, cInactive3].map(c => c.getId()));
              done();
            });
          });
        });
      });
    });
  });
});
