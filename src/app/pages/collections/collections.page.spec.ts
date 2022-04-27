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
import {RouterTestingModule} from '@angular/router/testing';
import {EmojiPipeModule} from '../../pipes/emoji-pipe/emoji-pipe.module';
import {ToastController} from '@ionic/angular';
import {MockToastController} from '../../../mocks';

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
    mockActivatedRoute = {snapshot: {paramMap: {get: () => 'collections'}}};

    TestBed.configureTestingModule({
      declarations: [CollectionsPage],
      imports: [RouterTestingModule.withRoutes([]), EmojiPipeModule],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: Router, useValue: routerSpy},
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: EmojisMap},
        {provide: ToastController, useClass: MockToastController}
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
    const backButton = fixture.debugElement.query(By.css('ion-header ion-back-button'));
    expect(backButton).toBeTruthy();
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
      expect(routerSpy.navigate.calls.first().args[0][0]).toBe(`${mockInactiveCollection.getId()}`);
      done();
    });
  });

  it('should click item and set it active when setting mode', async () => {
    component.managingMode = false;
    mockInactiveCollection.setId(1);
    const c = new Collection('', '', new Emoji('', ''));
    c.setActive();
    component.collections = [mockInactiveCollection, c];
    fixture.detectChanges();

    const toastController = TestBed.inject(ToastController);

    const spy = spyOn(service, 'setActiveCollection');
    spyOn(toastController, 'create').and.resolveTo({
      present: (): Promise<void> => Promise.resolve()
    } as HTMLIonToastElement);

    await component.onItemClick(mockInactiveCollection.getId());
    expect(spy).toHaveBeenCalledWith(mockInactiveCollection.getId());
    expect(toastController.create).toHaveBeenCalled();
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

  it('should navigate to new collection', async () => {
    await component.navigateToCollection();
    expect(routerSpy.navigate.calls.first().args[0][0]).toBe('new');
  });
});
