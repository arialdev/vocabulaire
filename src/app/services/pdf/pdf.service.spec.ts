import {TestBed} from '@angular/core/testing';

import {PdfService} from './pdf.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {EmojisMap} from '../emoji/emojisMap';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {MockStorageService} from '../storage/mock-storage.service';
import {TagService} from '../tag/tag.service';
import {Term} from '../../classes/term/term';
import {CollectionService} from '../collection/collection.service';
import {Tag} from '../../classes/tag/tag';
import {PDFGenerator} from '@awesome-cordova-plugins/pdf-generator';
import {Collection} from '../../classes/collection/collection';
import {FileService} from '../fileService/file.service';
import {Category} from '../../classes/category/category';
import {CategoryType} from '../../enums/enums';

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        {provide: EmojisMap},
        {provide: AbstractStorageService, useClass: MockStorageService}
      ]
    });
    service = TestBed.inject(PdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate PDF', async () => {
    const term = new Term('a', 'b');
    term.addGramaticalCategory(new Category('', CategoryType.gramatical));
    term.addThematicCategory(new Category('', CategoryType.gramatical));

    const tagService = TestBed.inject(TagService);
    spyOn(tagService, 'getTagById').and.resolveTo(new Tag('', undefined, undefined));
    spyOn(tagService, 'getTermsFromTag').and.resolveTo([term]);
    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'getCollectionById').and.resolveTo(new Collection('', '', undefined));
    spyOn(PDFGenerator, 'fromData');
    const fileService = TestBed.inject(FileService);
    spyOn(fileService, 'saveFileInCache').and.resolveTo({uri: ''});
    spyOn(fileService, 'shareFile');
    spyOn(fileService, 'getBase64').and.resolveTo('');

    await service.generatePDF(1, 1);
    expect(fileService.saveFileInCache).toHaveBeenCalled();
    expect(fileService.shareFile).toHaveBeenCalled();
  });

  it('should throw exception when generating PDF about nonexistent collection', async () => {
    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'getCollectionById').and.resolveTo(undefined);
    await expectAsync(service.generatePDF(-1, 1)).toBeRejectedWithError(`Collection with ID -1 not found`);
  });

  it('should throw exception when generating PDF about nonexistent tag', async () => {
    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'getCollectionById').and.resolveTo(new Collection('', '', undefined));
    const tagService = TestBed.inject(TagService);
    spyOn(tagService, 'getTagById').and.resolveTo(undefined);
    await expectAsync(service.generatePDF(1, -1)).toBeRejectedWithError(`Tag with ID -1 not found`);
  });
});
