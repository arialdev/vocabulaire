import {AfterContentChecked, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {SettingsService} from '../../services/settings/settings.service';
import {MenuController} from '@ionic/angular';
import {GuiLanguage} from '../../interfaces/gui-language';
import {SwiperComponent} from 'swiper/angular';
import SwiperCore, {Virtual} from 'swiper';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojiService} from '../../services/emoji/emoji.service';

SwiperCore.use([Virtual]);

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TutorialPage implements AfterContentChecked {

  @ViewChild('swiper', {static: false}) swiper: SwiperComponent;

  progress: number;
  showPreviousNavButton: boolean;
  showNextNavButton: boolean;

  languages: GuiLanguage[];
  preferredLanguage: GuiLanguage;


  collectionForm: FormGroup;
  modalStatus: boolean;
  selectedEmoji: Emoji;

  constructor(
    private menuController: MenuController,
    private settingsService: SettingsService,
    private emojiService: EmojiService
  ) {
    this.showPreviousNavButton = false;
    this.showNextNavButton = true;

    this.languages = this.settingsService.getLanguages();
    this.preferredLanguage = this.languages[0];

    this.collectionForm = new FormGroup({
      name: new FormControl('', Validators.required),
      prefix: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      icon: new FormControl('', Validators.required),
    });
    this.modalStatus = false;
  }

  ionViewDidEnter(): Promise<HTMLIonMenuElement> {
    return this.menuController.enable(false);
  }

  ionViewWillLeave(): Promise<HTMLIonMenuElement> {
    return this.menuController.enable(false);
  }

  ngAfterContentChecked() {
    if (this.swiper) {
      this.swiper.updateSwiper({});
      this.progress = (this.swiper.swiperRef.progress + 1) / this.swiper.swiperRef.slides.length;
    }
  }

  async changeLanguage(event) {
    const language: GuiLanguage = event.detail.value;
    await this.settingsService.setLanguage(language);
  }

  nextSlide() {
    console.log(this.swiper.swiperRef);
    this.swiper.swiperRef.slideNext();
  }

  previousSlide() {
    this.swiper.swiperRef.slidePrev();
  }

  navToHome() {
    throw new Error('Not implemented');
  }

  async onSubmit(): Promise<void> {
    throw new Error('Not implemented');
  }

  selectEmoji(emoji: Emoji): void {
    throw new Error('Not implemented');
  }

  toggleModal(): void {
    this.modalStatus = !this.modalStatus;
  }

  onSlideChange([event]: SwiperCore[]) {
    this.showPreviousNavButton = event.activeIndex !== 0;
    this.showNextNavButton = event.activeIndex !== event.slides.length - 1;
  }

  private selectDefaultEmoji(): void {
    this.selectEmoji(this.emojiService.getEmojiByName('2_smile.png'));
  }
}
