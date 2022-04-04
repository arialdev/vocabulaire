import {Component} from '@angular/core';
import {Term} from '../../classes/term/term';
import {CollectionService} from '../../services/collection/collection.service';
import {NavController} from '@ionic/angular';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojiService} from '../../services/emoji/emoji.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  terms: Term[] = [];
  activeCollection: Collection;
  simpleView: boolean;
  collectionIcon: string;
  collectionPrefix: string;

  constructor(private collectionService: CollectionService, private navController: NavController, private emojiService: EmojiService) {
    this.simpleView = true;
  }

  async ionViewWillEnter() {
    this.activeCollection = await this.collectionService.getActiveCollection();
    this.terms = this.activeCollection.getTerms();
    const emoji: Emoji = this.activeCollection.getLanguage().getIcon();
    this.collectionIcon = this.emojiService.getEmojiRoute(emoji);
    this.collectionPrefix = this.activeCollection.getLanguage().getPrefix();
  }

  async navigateToCollections() {
    await this.navController.navigateForward('collections');
  }

  async navigateToTerm(id?: number) {
    await this.navController.navigateForward(`term/${id ? id : 'new'}`);
  }
}
