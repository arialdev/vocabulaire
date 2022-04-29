import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {RouterTestingModule} from '@angular/router/testing';

import {AppComponent} from './app.component';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {MockStorageService} from './services/storage/mock-storage.service';
import {TranslateService} from '@ngx-translate/core';
import {MockMenuController, MockToastController, MockTranslateService} from '../mocks';
import {CollectionService} from './services/collection/collection.service';
import {Collection} from './classes/collection/collection';
import {Tag} from './classes/tag/tag';
import {Emoji} from './classes/emoji/emoji';
import {TagService} from './services/tag/tag.service';
import {MenuController, ToastController} from '@ionic/angular';
import {TagOptions} from './classes/tagOptions/tag-options';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {EmojisMap} from './services/emoji/emojisMap';
import {PdfService} from './services/pdf/pdf.service';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule
      ],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: TranslateService, useClass: MockTranslateService},
        {provide: MenuController, useClass: MockMenuController},
        {provide: EmojisMap},
        {provide: ToastController, useClass: MockToastController}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create the app', waitForAsync(() => {
    expect(app).toBeTruthy();
  }));

  it('should load tags', async () => {
    const c = new Collection('a', 'a', new Emoji('a', 'a'));
    const tag = new Tag('tag', undefined, undefined);
    c.addTag(tag);

    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'getActiveCollection').and.resolveTo(c);

    await app.loadTags();
    expect(app.tags).toEqual([tag]);
  });

  it('should load tag', async () => {
    spyOn(TagService, 'loadTag');
    const menuController = TestBed.inject(MenuController);
    spyOn(menuController, 'close');
    const tag = new Tag('tag', undefined, undefined);
    await app.loadTag(tag);
    expect(TagService.loadTag).toHaveBeenCalledWith(tag);
    expect(menuController.close).toHaveBeenCalled();
  });

  it('should delete tag', async () => {
    spyOn(app, 'loadTags');

    const tagService = TestBed.inject(TagService);
    spyOn(tagService, 'removeTag');

    const c = new Collection('a', 'a', new Emoji('a', 'a'));
    c.setId(1);
    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'getActiveCollection').and.resolveTo(c);

    const tag = new Tag('verbs', undefined, new TagOptions(''));
    tag.setId(8);

    await app.deleteTag(tag);
    expect(tagService.removeTag).toHaveBeenCalledWith(tag.getId(), c.getId());
    expect(app.loadTags).toHaveBeenCalled();
  });

  it('should export pdf from tag', async () => {
    const collection = new Collection('', '', undefined);
    collection.setId(1);
    const tag = new Tag('', undefined, undefined);
    tag.setId(2);

    // spyOn(window, 'setTimeout');
    const pdfService = TestBed.inject(PdfService);
    spyOn(pdfService, 'generatePDF');
    const menuController = TestBed.inject(MenuController);
    spyOn(menuController, 'close');
    const toastController = TestBed.inject(ToastController);
    spyOn(toastController, 'create').and.callThrough();

    await app.exportPDFFromTag(tag);

    expect(pdfService.generatePDF).not.toHaveBeenCalled();
    expect(menuController.close).not.toHaveBeenCalled();
    expect(toastController.create).toHaveBeenCalledOnceWith({
      header: 'Error',
      message: 'Device cannot generate PDFs',
      color: 'danger',
      duration: 1000
    });
    await app.exportPDFFromTag(tag);
    expect(toastController.create).toHaveBeenCalledTimes(2);


    document.dispatchEvent(new CustomEvent('deviceready'));
    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'getActiveCollection').and.resolveTo(collection);
    await app.exportPDFFromTag(tag);
    expect(pdfService.generatePDF).toHaveBeenCalledWith(collection.getId(), tag.getId());
    expect(menuController.close).toHaveBeenCalled();
  });
});
