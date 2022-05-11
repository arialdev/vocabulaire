import {TestBed, waitForAsync} from '@angular/core/testing';

import {TagService} from './tag.service';
import {EmojisMap} from '../emoji/emojisMap';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {MockStorageService} from '../storage/mock-storage.service';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {CollectionService} from '../collection/collection.service';
import {Tag} from '../../classes/tag/tag';
import {TagOptions} from '../../classes/tagOptions/tag-options';
import {Term} from '../../classes/term/term';
import {Category} from '../../classes/category/category';
import {CategoryType} from '../../enums/enums';

describe('TagService', () => {
  let service: TagService;

  let collection: Collection;
  let collectionService: CollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: EmojisMap},
        {provide: AbstractStorageService, useClass: MockStorageService}
      ]
    });
    service = TestBed.inject(TagService);
    collectionService = TestBed.inject(CollectionService);
  });

  beforeEach(waitForAsync(() => {
    collection = new Collection('English', 'EN', new Emoji('flags', 'uk'));
    initialize();
  }));

  const initialize = (): Promise<void> => new Promise(res => {
    collectionService.addCollection(collection).then((c) => {
      collectionService.setActiveCollection(c.getId()).then(cActive => {
        collection = cActive;
        res();
      });
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add tag', async () => {
    let tag = new Tag('tag', new Emoji('a', 'a'), new TagOptions(''));
    tag = await service.addTag(tag, collection.getId());
    collection = await collectionService.getActiveCollection();
    expect(collection.getTags()).toEqual([tag]);
  });

  it('should throw error if missing collection when adding tag', async () => {
    const tag = new Tag('tag', new Emoji('a', 'a'), new TagOptions(''));
    await expectAsync(service.addTag(tag, -1)).toBeRejectedWithError('Collection with ID -1 not found');
  });

  it('should throw error if missing collection when removing it', async () => {
    await expectAsync(service.removeTag(undefined, -1)).toBeRejectedWithError('Collection with ID -1 not found');
  });

  it('should throw error if missing tag when removing it', async () => {
    await expectAsync(service.removeTag(-1, collection.getId())).toBeRejectedWithError('Tag with ID -1 not found');
  });

  it('should delete tag', async () => {
    let tag = new Tag('tag', new Emoji('a', 'a'), new TagOptions(''));
    tag = await service.addTag(tag, collection.getId());
    await service.removeTag(tag.getId(), collection.getId());
    collection = await collectionService.getActiveCollection();
    expect(collection.getTags().length).toBe(0);
  });

  it('should throw error when adding tag and higher bound had been reached', async () => {
    const tag: Tag = new Tag('tag', new Emoji('', ''), new TagOptions(''));
    for (let i = 0; i < TagService.maxTagsBound; i++) {
      await service.addTag(tag, collection.getId());
    }
    await expectAsync(service.addTag(tag, collection.getId())).toBeRejectedWithError('tag.toast.fail.max-reached.msg');
  });

  it('should get tag as promise', async () => {
    let res = await TagService.getTagAsPromise();
    expect(res).toBeUndefined();
    let tag = new Tag('tag', new Emoji('a', 'a'), new TagOptions(''));
    tag = await service.addTag(tag, collection.getId());
    TagService.loadTag(tag);
    res = await TagService.getTagAsPromise();
    expect(res).toEqual(tag);
  });

  it('should get existing tag by id', async () => {
    const mockCollection = new Collection('', '', undefined);
    const tag = new Tag('mockTag', undefined, undefined);
    tag.setId(1);
    mockCollection.addTag(tag);
    spyOn(collectionService, 'getCollectionById').and.resolveTo(mockCollection);
    await expectAsync(service.getTagById(tag.getId(), 1)).toBeResolvedTo(tag);
  });

  it('should get undefined when requesting nonexistent tag by id', async () => {
    spyOn(collectionService, 'getCollectionById').and.resolveTo(new Collection('', '', undefined));
    await expectAsync(service.getTagById(undefined, undefined)).toBeResolvedTo(undefined);
  });

  it('should throw error when requesting tag by id from nonexistent collection', async () => {
    spyOn(collectionService, 'getCollectionById').and.resolveTo(undefined);
    await expectAsync(service.getTagById(undefined, -1)).toBeRejectedWithError(`Collection with ID -1 not found`);
  });

  it('should get term list from tag options', async () => {
    const mockCollection = new Collection('', '', undefined);
    mockCollection.setId(5);
    const gc = new Category('gc', CategoryType.gramatical);
    gc.setId(1);
    const tc = new Category('tc', CategoryType.thematic);
    tc.setId(2);
    const terms: Term[] = [];
    for (let i = 97; i < 102; i++) {
      const term = new Term(String.fromCharCode(i), String.fromCharCode(i - 32));
      term.setId(1);
      if (i % 2 === 0) {
        term.addThematicCategory(tc);
      } else {
        term.addGramaticalCategory(gc);
      }
      mockCollection.addTerm(term);
      terms.push(term);
    }

    const tagText = new Tag('tag1', undefined, new TagOptions('a'));
    tagText.setId(1);
    const tagOptionsGC = new TagOptions('');
    tagOptionsGC.addGramaticalCategory(gc, true);
    const tagCG = new Tag('tag2', undefined, tagOptionsGC);
    tagCG.setId(2);
    const tagOptionsTC = new TagOptions('');
    tagOptionsTC.addThematicCategory(tc, true);
    const tagTC = new Tag('tag3', undefined, tagOptionsTC);
    tagTC.setId(3);
    const tagOptionsCC = new TagOptions('');
    tagOptionsCC.addGramaticalCategory(gc, true);
    tagOptionsCC.addThematicCategory(tc, true);
    const tagCC = new Tag('tag4', undefined, tagOptionsCC);
    tagCC.setId(4);

    mockCollection.addTag(tagText);
    mockCollection.addTag(tagCG);
    mockCollection.addTag(tagTC);
    mockCollection.addTag(tagCC);
    spyOn(collectionService, 'getCollectionById').and.resolveTo(mockCollection);

    await expectAsync(service.getTermsFromTag(tagText, mockCollection)).toBeResolvedTo([terms[0]]);
    await expectAsync(service.getTermsFromTag(tagCG, mockCollection)).toBeResolvedTo([terms[0], terms[2], terms[4]]);
    await expectAsync(service.getTermsFromTag(tagTC, mockCollection)).toBeResolvedTo([terms[1], terms[3]]);
    await expectAsync(service.getTermsFromTag(tagCC, mockCollection)).toBeResolvedTo([]);

    await expectAsync(service.getTermsFromTag(tagText.getId(), mockCollection.getId())).toBeResolvedTo([terms[0]]);
    await expectAsync(service.getTermsFromTag(tagCG.getId(), mockCollection.getId())).toBeResolvedTo([terms[0], terms[2], terms[4]]);
    await expectAsync(service.getTermsFromTag(tagTC.getId(), mockCollection.getId())).toBeResolvedTo([terms[1], terms[3]]);
    await expectAsync(service.getTermsFromTag(tagCC.getId(), mockCollection.getId())).toBeResolvedTo([]);
  });

  it('should throw error when requesting terms from tag in an nonexistent collection', async () => {
    spyOn(collectionService, 'getCollectionById').and.resolveTo(undefined);
    await expectAsync(service.getTermsFromTag(undefined, undefined)).toBeRejectedWithError(`Collection with ID undefined not found`);
    await expectAsync(service.getTermsFromTag(undefined, 5)).toBeRejectedWithError(`Collection with ID 5 not found`);
  });

  it('should throw error when requesting terms from unexistent tag', async () => {
    const mockCollection = new Collection('', '', undefined);
    mockCollection.setId(5);
    const tag1 = new Tag('', undefined, new TagOptions(''));
    tag1.setId(3);
    mockCollection.addTag(tag1);
    const tag2 = new Tag('', undefined, new TagOptions(''));
    tag2.setId(9);
    spyOn(collectionService, 'getCollectionById').and.resolveTo(mockCollection);
    await expectAsync(service.getTermsFromTag(undefined, mockCollection))
      .toBeRejectedWithError(`Tag with ID undefined not found in collection`);
    await expectAsync(service.getTermsFromTag(undefined, 5)).toBeRejectedWithError(`Tag with ID undefined not found in collection`);
    await expectAsync(service.getTermsFromTag(5, 5)).toBeRejectedWithError(`Tag with ID 5 not found in collection`);
    await expectAsync(service.getTermsFromTag(tag2, mockCollection)).toBeRejectedWithError(`Tag with ID 9 not found in collection`);
  });
});
