import {Component} from '@angular/core';
import {Term} from '../../classes/term/term';
import {CollectionService} from '../../services/collection/collection.service';
import {AlertController, AlertInput, NavController} from '@ionic/angular';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojiService} from '../../services/emoji/emoji.service';
import {Category} from '../../classes/category/category';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage {
  terms: Term[];
  activeCollection: Collection;
  simpleView: boolean;
  collectionIcon: string;
  collectionPrefix: string;
  sortingOptions: string[];
  private activeSortingCode: number;
  private readonly sortingFunctions: any;
  private filters: { 0: []; 1: [] };

  constructor(
    private collectionService: CollectionService,
    private navController: NavController,
    private emojiService: EmojiService,
    private alertController: AlertController) {
    this.terms = [];
    this.simpleView = true;
    this.filters = {0: [], 1: []};

    this.sortingOptions = ['Original term', 'Translated term', 'Updated date'];
    this.activeSortingCode = -3;
    this.sortingFunctions = {
      '-1': (t1: Term, t2: Term) => -1 * t1.getOriginalTerm().localeCompare(t2.getOriginalTerm()),
      1: (t1: Term, t2: Term) => t1.getOriginalTerm().localeCompare(t2.getOriginalTerm()),
      '-2': (t1: Term, t2: Term) => -1 * t1.getTranslatedTerm().localeCompare(t2.getTranslatedTerm()),
      2: (t1: Term, t2: Term) => t1.getTranslatedTerm().localeCompare(t2.getTranslatedTerm()),
      '-3': (t1: Term, t2: Term) => t1.getUpdatingTime() - t2.getUpdatingTime(),
      3: (t1: Term, t2: Term) => t2.getUpdatingTime() - t1.getUpdatingTime(),
    };
  }

  async ionViewWillEnter(): Promise<void> {
    this.activeCollection = await this.collectionService.getActiveCollection();
    this.terms = this.activeCollection.getTerms();
    this.sort(this.activeSortingCode);
    const emoji: Emoji = this.activeCollection.getLanguage().getIcon();
    this.collectionIcon = this.emojiService.getEmojiRoute(emoji);
    this.collectionPrefix = this.activeCollection.getLanguage().getPrefix();
  }

  async navigateToCollections(): Promise<void> {
    await this.navController.navigateForward('collections');
  }

  async navigateToTerm(id?: number) {
    await this.navController.navigateForward(`term/${id ? id : 'new'}`);
  }

  sort(code, forced = false): void {
    if (!forced && this.activeSortingCode === code) {
      code *= -1;
    }
    this.terms.sort(this.sortingFunctions[code]);
    this.activeSortingCode = code;
  }

  async presentAlertCheckbox(categoryType: number): Promise<void> {
    let categories: Category[];
    if (categoryType === 0) {
      categories = this.activeCollection.getGramaticalCategories();
    } else {
      categories = this.activeCollection.getThematicCategories();
    }

    const inputs: AlertInput[] = [];
    categories.forEach(c => {
      inputs.push({
        name: `checkbox${c.getId()}`,
        type: `checkbox`,
        label: c.getName(),
        value: c,
        checked: this.filters[categoryType].includes(c)
      });
    });

    const alert = await this.alertController.create({
      header: 'Filter terms',
      inputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: (checkedCategories) => {
            this.filters[categoryType] = checkedCategories;
            this.filterTerms();
          }
        }
      ]
    });
    await alert.present();
  }

  private filterTerms(): void {
    this.terms = this.activeCollection.getTerms().filter(t => {
      const gramaticalRes = t.getGramaticalCategories().some(c => this.filters[0].map((cc: Category) => cc.getId()).includes(c.getId()));
      const thematicRes = t.getThematicCategories().some(c => this.filters[1].map((cc: Category) => cc.getId()).includes(c.getId()));

      if (!this.filters[0].length && !this.filters[1].length) {
        return true;
      }
      if (this.filters[0].length && !this.filters[1].length) {
        return gramaticalRes;
      }
      if (!this.filters[0].length && this.filters[1].length) {
        return thematicRes;
      }
      return gramaticalRes && thematicRes;
    });
    this.sort(this.activeSortingCode, true);
  }
}
