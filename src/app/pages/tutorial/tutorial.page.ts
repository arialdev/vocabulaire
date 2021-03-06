import {Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {SettingsService} from '../../services/settings/settings.service';
import {MenuController, NavController} from '@ionic/angular';
import {GuiLanguage} from '../../interfaces/gui-language';
import {SwiperComponent} from 'swiper/angular';

import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojiService} from '../../services/emoji/emoji.service';
import {Collection} from '../../classes/collection/collection';
import {CollectionService} from '../../services/collection/collection.service';


@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TutorialPage {

  @ViewChild('swiper', {static: false}) swiper: SwiperComponent;

  languages: GuiLanguage[];
  preferredLanguage: GuiLanguage;
  compareWith = compareLanguages;

  collectionForm: FormGroup;
  modalStatus: boolean;
  selectedEmoji: Emoji;
  maxLanguageNameLength = 25;
  readonly validationMessages = {
    name: [
      {type: 'required', message: 'collections.form.validation.name.required'},
      {type: 'minlength', message: 'collections.form.validation.name.min'},
      {type: 'maxlength', message: 'collections.form.validation.name.max'}
    ],
    prefix: [
      {type: 'required', message: 'collections.form.validation.prefix.required'},
      {type: 'minlength', message: 'collections.form.validation.prefix.min'},
      {type: 'maxlength', message: 'collections.form.validation.prefix.max'},
    ],
    icon: [{type: 'required', message: 'collections.form.validation.prefix.required'}]
  };
  showLength = {name: false};

  readonly translation = {
    form: {
      name: 'collections.form.name'
    }
  };

  constructor(
    private menuController: MenuController,
    private settingsService: SettingsService,
    private emojiService: EmojiService,
    private navController: NavController,
    private collectionService: CollectionService
  ) {
    /* Slide 1 */
    this.languages = this.settingsService.getLanguages();

    /* Slide 2 */
    this.collectionForm = new FormGroup({
      name: new FormControl('', Validators.required),
      prefix: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      icon: new FormControl('', Validators.required),
    });
    this.modalStatus = false;
    this.selectEmoji(this.emojiService.getEmojiByName('2_smile.png'));
  }

  /* Component */
  async ionViewWillEnter() {
    this.preferredLanguage = (await this.settingsService.getPreferredLanguage()) ?? this.languages[0];
  }

  ionViewDidEnter(): Promise<HTMLIonMenuElement> {
    return this.menuController.enable(false);
  }

  ionViewWillLeave(): Promise<HTMLIonMenuElement> {
    return this.menuController.enable(true);
  }

  /* Slide 1 */
  async changeLanguage(event) {
    const language: GuiLanguage = event.detail.value;
    await this.settingsService.setLanguage(language);
  }

  /* Slide 2 */
  async onSubmit(): Promise<boolean> {
    if (this.collectionForm.valid) {
      const collection: Collection = new Collection(
        this.collectionForm.get('name').value,
        this.collectionForm.get('prefix').value,
        this.selectedEmoji
      );
      const newCollection = await this.collectionService.addCollection(collection);
      await this.collectionService.setActiveCollection(newCollection.getId());
      await this.settingsService.initializeApp();
      return this.navController.navigateForward('/');
    } else {
      this.collectionForm.markAllAsTouched();
    }
  }

  selectEmoji(emoji: Emoji): void {
    this.modalStatus = false;
    if (!emoji) {
      return;
    }
    this.selectedEmoji = emoji;
    this.collectionForm.patchValue({icon: emoji});
  }

  toggleModal(): void {
    this.modalStatus = !this.modalStatus;
  }

  inputOnFocus(formControlName: string): void {
    this.showLength[formControlName] = true;
  }

  inputOnBlur(formControlName: string): void {
    this.showLength[formControlName] = false;
  }

  generatePrefix(event) {
    if (event.detail.value.length >= 2) {
      this.collectionForm.get('prefix').patchValue(event.detail.value.substring(0, 2).toUpperCase());
    } else {
      this.collectionForm.get('prefix').patchValue('');
      this.collectionForm.get('prefix').markAsTouched();
    }
  }

  autocapitalize(event) {
    this.collectionForm.get('prefix').patchValue(event.detail.value.toUpperCase());
  }
}

const compareLanguages = (c1: GuiLanguage, c2: GuiLanguage) => c1.prefix === c2.prefix;
