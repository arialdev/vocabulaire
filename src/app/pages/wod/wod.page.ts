import {Component,} from '@angular/core';
import {CollectionService} from '../../services/collection/collection.service';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojiService} from '../../services/emoji/emoji.service';
import {TermService} from '../../services/term/term.service';
import {Wod} from '../../classes/wod/wod';

@Component({
  selector: 'app-wod',
  templateUrl: './wod.page.html',
  styleUrls: ['./wod.page.scss'],
})
export class WodPage {

  bulbPath: string;

  wod: Wod | undefined;
  languageFlag: string;
  termsBound: number;

  private activeCollection: Collection;

  constructor(
    private collectionService: CollectionService,
    private emojiService: EmojiService,
    private termService: TermService,
  ) {
    this.wod = undefined;
  }

  async ionViewWillEnter() {
    this.activeCollection = await this.collectionService.getActiveCollection();
    this.wod = await this.termService.getWoD(this.activeCollection.getId());
    if (this.wod) {
      this.bulbPath = `assets/img/bulb-on.png`;
      const icon: Emoji = this.activeCollection.getLanguage().getIcon();
      this.languageFlag = this.emojiService.getEmojiRoute(icon);
    } else {
      this.bulbPath = `assets/img/bulb-off.png`;
      this.termsBound = this.termService.getWODBound();
    }
  }
}
