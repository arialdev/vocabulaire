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
});
