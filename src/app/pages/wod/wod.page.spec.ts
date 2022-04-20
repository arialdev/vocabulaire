import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {WodPage} from './wod.page';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {EmojisMap} from '../../services/emoji/emojisMap';
import {CollectionService} from '../../services/collection/collection.service';
import {TermService} from '../../services/term/term.service';
import {Collection} from '../../classes/collection/collection';
import {Wod} from '../../classes/wod/wod';
import {Term} from '../../classes/term/term';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('WodPage', () => {
  let component: WodPage;
  let fixture: ComponentFixture<WodPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WodPage],
      imports: [IonicModule.forRoot()],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: EmojisMap},
        // {provide: CollectionService, useClass: MockCollectionService},
        // {provide: TermService, useClass: MockCollectionService}
      ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(WodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load', async () => {
    const collection = new Collection('French', 'Francés', undefined);
    collection.setId(1);
    const collectionService = TestBed.inject(CollectionService);
    const termService = TestBed.inject(TermService);
    await spyOn(collectionService, 'getActiveCollection').and.resolveTo(collection);
    await spyOn(termService, 'getWoD').and.resolveTo(new Wod(new Term('Mano', 'Main')));
    await component.ionViewWillEnter();
    expect(component.bulbPath).toBe(`assets/img/bulb-on.png`);
  });

  it('should not load', async () => {
    const collection = new Collection('French', 'Francés', undefined);
    collection.setId(1);
    const collectionService = TestBed.inject(CollectionService);
    const termService = TestBed.inject(TermService);
    await spyOn(collectionService, 'getActiveCollection').and.resolveTo(collection);
    await spyOn(termService, 'getWoD').and.resolveTo(undefined);
    await component.ionViewWillEnter();
    expect(component.bulbPath).toBe(`assets/img/bulb-off.png`);
  });
});
