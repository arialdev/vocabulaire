import {Pipe, PipeTransform} from '@angular/core';
import {EmojiService} from '../../services/emoji/emoji.service';
import {Emoji} from '../../classes/emoji/emoji';

@Pipe({
  name: 'emoji'
})
export class EmojiPipe implements PipeTransform {

  constructor(private emojiService: EmojiService) {
  }

  transform(value: Emoji): string {
    return this.emojiService.getEmojiRoute(value);
  }

}
