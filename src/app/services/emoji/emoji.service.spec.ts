import {TestBed} from '@angular/core/testing';

import {EmojiService} from './emoji.service';
import {EmojisMap} from './emojisMap';
import {Emoji} from '../../classes/emoji/emoji';

describe('EmojiService', () => {
  let service: EmojiService;
  let mockEmojisMap;
  let emoji: Emoji;

  beforeEach(() => {
    mockEmojisMap = {
      emojisMap: {
        people: ['2_smile.png', '1_angry.png'],
        food: ['3_apple.png'],
      }
    };
    emoji = new Emoji('2_smile.png', 'people');

    TestBed.configureTestingModule({
      providers: [
        {provide: EmojisMap, useValue: mockEmojisMap}
      ]
    });
    service = TestBed.inject(EmojiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('expect get emojis ids from category', () => {
    expect(service.getEmojisFromCategory('people')).toEqual([emoji, new Emoji('1_angry.png', 'people')]);
    expect(service.getEmojisFromCategory('food')).toEqual([new Emoji('3_apple.png', 'food')]);
  });

  it('expect get Emoji by id', () => {
    expect(service.getEmojiByName('2_smile.png')).toEqual(emoji);
  });

  it('expect get emojis route', () => {
    const em = service.getEmojiByName(emoji.getName());
    const route = service.getEmojiRoute(em);
    expect(route).toMatch(/^[a-z_\-\s0-9\.\/]+\..*$/);
    expect(route).toContain(emoji.getName());
  });

  it('expect get emoji categories', () => {
    expect(service.getCategories()).toEqual(['people', 'food']);
  });

  it('expect undefined get requesting non existing emoji', () => {
    expect(service.getEmojiRoute(undefined)).toBeUndefined();
    expect(service.getEmojiRoute(new Emoji('emojiFalso', 'muyFalso'))).toBeUndefined();
  });

  it('should get categoryPic', () => {
    expect(service.getCategoryPic('people')).toBeTruthy();
  });
});
