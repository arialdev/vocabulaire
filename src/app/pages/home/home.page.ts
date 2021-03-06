import {Component} from '@angular/core';
import {Term} from '../../classes/term/term';
import {CollectionService} from '../../services/collection/collection.service';
import {AlertController, AlertInput, NavController, ToastController} from '@ionic/angular';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojiService} from '../../services/emoji/emoji.service';
import {Category} from '../../classes/category/category';
import {TranslateService} from '@ngx-translate/core';
import {TagOptions} from '../../classes/tagOptions/tag-options';
import {Tag} from '../../classes/tag/tag';
import {TagService} from '../../services/tag/tag.service';

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
  searchValue: string;

  isFiltering: boolean;
  activeTag: Tag;
  isTagButtonAvailable: boolean;

  readonly translation = {
    searchbarPlaceholder: 'home.searchbar-placeholder',
  };

  private activeSortingCode: number;
  private readonly sortingFunctions: any;
  private readonly filters: any;
  private toast: HTMLIonToastElement;

  constructor(
    private collectionService: CollectionService,
    private navController: NavController,
    private emojiService: EmojiService,
    private alertController: AlertController,
    private translateService: TranslateService,
    private tagService: TagService,
    private toastController: ToastController
  ) {
    this.terms = [];
    this.simpleView = true;
    this.filters = {0: [], 1: []};
    this.activeSortingCode = -3;
    this.sortingFunctions = {
      '-1': (t1: Term, t2: Term) => -1 * t1.getOriginalTerm().localeCompare(t2.getOriginalTerm()),
      1: (t1: Term, t2: Term) => t1.getOriginalTerm().localeCompare(t2.getOriginalTerm()),
      '-2': (t1: Term, t2: Term) => -1 * t1.getTranslatedTerm().localeCompare(t2.getTranslatedTerm()),
      2: (t1: Term, t2: Term) => t1.getTranslatedTerm().localeCompare(t2.getTranslatedTerm()),
      '-3': (t1: Term, t2: Term) => t1.getUpdatingTime() - t2.getUpdatingTime(),
      3: (t1: Term, t2: Term) => t2.getUpdatingTime() - t1.getUpdatingTime(),
    };
    this.searchValue = '';
    this.isFiltering = false;
    this.activeTag = undefined;
    this.isTagButtonAvailable = true;
  }

  async ionViewWillEnter(): Promise<void> {
    this.activeCollection = await this.collectionService.getActiveCollection();
    this.terms = this.activeCollection.getTerms();
    this.sort(this.activeSortingCode);
    const emoji: Emoji = this.activeCollection.getLanguage().getIcon();
    this.collectionIcon = this.emojiService.getEmojiRoute(emoji);
    this.collectionPrefix = this.activeCollection.getLanguage().getPrefix();
    this.sortingOptions = Object
      .values(await this.translateService.get(['home.sort.opt.t-org', 'home.sort.opt.t-trans', 'home.sort.opt.date'])
        .toPromise());
    await this.loadTag();
    TagService.getTagDeletionAsObservable().subscribe(async v => {
      if (this.activeTag && this.activeTag.getId() === v) {
        this.activeTag = undefined;
      }
      await this.checkTagButtonAvailability(true);
      if (v !== undefined) {
        await this.toast?.dismiss();
        this.toast = await this.toastController.create({
          message: 'Tag deleted successfully',
          color: 'success',
          icon: 'trash',
          duration: 800
        });
        await this.toast.present();
      }
    });
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
    let categoryText: string;
    if (categoryType === 0) {
      categories = this.activeCollection.getGramaticalCategories();
      categoryText = (await this.translateService.get('data.category.gc').toPromise()).toLowerCase();
    } else {
      categories = this.activeCollection.getThematicCategories();
      categoryText = (await this.translateService.get('data.category.tc').toPromise()).toLowerCase();
    }

    const inputs: AlertInput[] = [];
    categories.forEach(c => {
      inputs.push({
        name: `checkbox${c.getId()}`,
        type: `checkbox`,
        label: c.getName(),
        value: c,
        checked: this.filters[categoryType].some((category: Category) => category.getId() === c.getId())
      });
    });

    const alert = await this.alertController.create({
      header: await this.translateService.get('home.filter.label', {type: categoryText}).toPromise(),
      inputs,
      buttons: [
        {
          text: await this.translateService.get('home.filter.cancel').toPromise(),
          role: 'cancel',
        },
        {
          text: await this.translateService.get('home.filter.ok').toPromise(),
          handler: (checkedCategories) => {
            this.filters[categoryType] = checkedCategories;
            this.terms = this.activeCollection.getTerms();
            this.handleSearchbar({target: {value: this.searchValue}});
            this.filterTerms();
          }
        }
      ]
    });
    await alert.present();
  }

  async handleSearchbar(event) {
    const text = event.target.value.toLowerCase();
    const defaultTerms = this.activeCollection.getTerms();
    this.terms = defaultTerms.filter(t =>
      t.getOriginalTerm().toLowerCase().includes(text)
      || t.getTranslatedTerm().toLowerCase().includes(text)
      || t.getNotes().toLowerCase().includes(text)
      || sanitizeText(t.getOriginalTerm()).includes(text)
      || sanitizeText(t.getTranslatedTerm()).includes(text)
      || sanitizeText(t.getNotes()).includes(text)
    );
    await this.filterTerms();
    this.activeTag = undefined;
    return this.checkTagButtonAvailability();
  }

  async toggleTag(): Promise<void> {
    if (this.activeTag) {
      const tag = await TagService.getTagAsPromise();
      if (tag) {
        await this.tagService.removeTag(tag.getId(), this.activeCollection.getId());
        this.activeTag = undefined;
      }
    } else {
      const tagOptions = new TagOptions(this.searchValue);
      this.filters[0].forEach(gc => tagOptions.addGramaticalCategory(gc, true));
      this.filters[1].forEach(tc => tagOptions.addThematicCategory(tc, true));
      await this.navController.navigateForward('tag/new', {state: {tagOptions}});
    }
  }

  private async checkTagButtonAvailability(refresh = false): Promise<void> {
    if (refresh) {
      this.activeCollection = await this.collectionService.getActiveCollection();
    }
    this.isTagButtonAvailable = Boolean(this.activeTag) || this.activeCollection.getTags().length < TagService.maxTagsBound;
  }

  private filterTerms(): Promise<void> {
    this.terms = this.terms.filter(t => {
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

    const activeFilters = Object.values(this.filters).map((l: Category[]) => l.length).reduce((acc, l) => acc + l);
    this.isFiltering = activeFilters > 0;
    this.activeTag = undefined;
    return this.checkTagButtonAvailability();
  }

  private async loadTag() {
    TagService.getTagAsObservable().subscribe(async (tag: Tag) => {
      if (tag) {
        const tagOptions = tag.getOptions();
        this.searchValue = tagOptions.getSearchText();
        this.filters[0] = tagOptions.getGramaticalCategories();
        this.filters[1] = tagOptions.getThematicCategories();
        this.terms = this.activeCollection.getTerms();
        await this.handleSearchbar({target: {value: this.searchValue}});
        this.activeTag = tag;
      }
      await this.checkTagButtonAvailability();
    });
  }
}

const sanitizeText = (text: string) => text
  .normalize('NFD')
  .replaceAll(/[\u0300-\u036f]/g, '')
  .toLowerCase();
