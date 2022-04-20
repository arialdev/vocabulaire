import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule, NavController} from '@ionic/angular';

import {HeaderComponent} from './header.component';
import {MockNavController} from '../../../mocks';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {EmojisMap} from '../../services/emoji/emojisMap';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {CollectionService} from '../../services/collection/collection.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  let collection: Collection;
  let collectionService: CollectionService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: NavController, useClass: MockNavController},
        {provide: EmojisMap},
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
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        res();
      });
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to collections', async () => {
    const navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'navigateForward');
    await component.navigateToCollections();
    expect(navCtrl.navigateForward).toHaveBeenCalledWith('collections');
  });
});
