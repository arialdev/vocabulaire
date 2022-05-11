import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule, MenuController, ToastController} from '@ionic/angular';

import {MenuPage} from './menu.page';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {Tag} from '../../classes/tag/tag';
import {CollectionService} from '../../services/collection/collection.service';
import {TagService} from '../../services/tag/tag.service';
import {TagOptions} from '../../classes/tagOptions/tag-options';
import {PdfService} from '../../services/pdf/pdf.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {TranslateService} from '@ngx-translate/core';
import {MockMenuController, MockToastController, MockTranslateService} from '../../../mocks';
import {EmojisMap} from '../../services/emoji/emojisMap';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('MenuPage', () => {
  let component: MenuPage;
  let fixture: ComponentFixture<MenuPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MenuPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule
      ],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: TranslateService, useClass: MockTranslateService},
        {provide: MenuController, useClass: MockMenuController},
        {provide: EmojisMap},
        {provide: ToastController, useClass: MockToastController},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tags', async () => {
    const c = new Collection('a', 'a', new Emoji('a', 'a'));
    const tag = new Tag('tag', undefined, undefined);
    c.addTag(tag);

    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'getActiveCollection').and.resolveTo(c);

    await component.loadTags();
    expect(component.tags).toEqual([tag]);
  });

  it('should load tag', async () => {
    spyOn(TagService, 'loadTag');
    const menuController = TestBed.inject(MenuController);
    spyOn(menuController, 'close');
    const tag = new Tag('tag', undefined, undefined);
    await component.loadTag(tag);
    expect(TagService.loadTag).toHaveBeenCalledWith(tag);
    expect(menuController.close).toHaveBeenCalled();
  });

  it('should delete tag', async () => {
    spyOn(component, 'loadTags');

    const tagService = TestBed.inject(TagService);
    spyOn(tagService, 'removeTag');

    const c = new Collection('a', 'a', new Emoji('a', 'a'));
    c.setId(1);
    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'getActiveCollection').and.resolveTo(c);

    const tag = new Tag('verbs', undefined, new TagOptions(''));
    tag.setId(8);

    await component.deleteTag(tag);
    expect(tagService.removeTag).toHaveBeenCalledWith(tag.getId(), c.getId());
    expect(component.loadTags).toHaveBeenCalled();
  });

  it('should export pdf from tag', async () => {
    const collection = new Collection('', '', undefined);
    collection.setId(1);
    const tag = new Tag('', undefined, undefined);
    tag.setId(2);

    const pdfService = TestBed.inject(PdfService);
    spyOn(pdfService, 'generatePDF');
    const menuController = TestBed.inject(MenuController);
    spyOn(menuController, 'close');
    const toastController = TestBed.inject(ToastController);
    spyOn(toastController, 'create').and.callThrough();

    await component.exportPDFFromTag(tag);

    expect(pdfService.generatePDF).not.toHaveBeenCalled();
    expect(menuController.close).not.toHaveBeenCalled();
    expect(toastController.create).toHaveBeenCalledOnceWith({
      header: 'Error',
      message: 'Device cannot generate PDFs',
      color: 'danger',
      duration: 1000
    });
    await component.exportPDFFromTag(tag);
    expect(toastController.create).toHaveBeenCalledTimes(2);


    document.dispatchEvent(new CustomEvent('deviceready'));
    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'getActiveCollection').and.resolveTo(collection);
    await component.exportPDFFromTag(tag);
    expect(pdfService.generatePDF).toHaveBeenCalledWith(collection.getId(), tag.getId());
    expect(menuController.close).toHaveBeenCalled();
  });
});
