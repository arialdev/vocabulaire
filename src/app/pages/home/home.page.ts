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
  sortingOptions: string[];
  private defaultSortingCode: number;
  private readonly sortingFunctions: any;

  constructor(
    private collectionService: CollectionService,
    private navController: NavController,
    private emojiService: EmojiService) {
    this.simpleView = true;

    this.sortingOptions = ['Original term', 'Translated term', 'Updated date'];
    this.defaultSortingCode = -3;
    this.sortingFunctions = {
      '-1': (t1: Term, t2: Term) => -1 * t1.getOriginalTerm().localeCompare(t2.getOriginalTerm()),
      1: (t1: Term, t2: Term) => t1.getOriginalTerm().localeCompare(t2.getOriginalTerm()),
      '-2': (t1: Term, t2: Term) => -1 * t1.getTranslatedTerm().localeCompare(t2.getTranslatedTerm()),
      2: (t1: Term, t2: Term) => t1.getTranslatedTerm().localeCompare(t2.getTranslatedTerm()),
      '-3': (t1: Term, t2: Term) => t1.getUpdatingTime() - t2.getUpdatingTime(),
      3: (t1: Term, t2: Term) => t2.getUpdatingTime() - t1.getUpdatingTime(),
    };
  }

  async ionViewWillEnter() {
    this.activeCollection = await this.collectionService.getActiveCollection();
    this.terms = this.activeCollection.getTerms();
    this.sort(this.defaultSortingCode);
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

  sort(code) {
    if (this.defaultSortingCode === code) {
      code *= -1;
    }
    this.terms.sort(this.sortingFunctions[code]);
    this.defaultSortingCode = code;
  }
}
