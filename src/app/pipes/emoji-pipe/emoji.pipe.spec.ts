import {EmojiPipe} from './emoji.pipe';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojiService} from '../../services/emoji/emoji.service';
import {EmojisMap} from '../../services/emoji/emojisMap';

describe('EmojiPipePipe', () => {

  let emoji: Emoji;
  let pipe: EmojiPipe;

  beforeEach(() => {
    emoji = new Emoji('841_canoe.png', '5_activities');
    pipe = new EmojiPipe(new EmojiService(new EmojisMap()));
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should get route', () => {
    expect(pipe.transform(emoji)).toBeTruthy();
  });
});
