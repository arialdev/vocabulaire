import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule, MenuController, NavController} from '@ionic/angular';

import {TutorialPage} from './tutorial.page';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {MockMenuController, MockNavController, MockTranslateService} from '../../../mocks';
import {EmojisMap} from '../../services/emoji/emojisMap';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateService} from '@ngx-translate/core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SwiperComponent, SwiperModule} from 'swiper/angular';
import {EmojiPipeModule} from '../../pipes/emoji-pipe/emoji-pipe.module';
import {EmojiPickerModule} from '../../components/emoji-picker/emoji-picker.module';
import {ReactiveFormsModule} from '@angular/forms';
import SwiperCore from 'swiper';
import {SettingsService} from '../../services/settings/settings.service';
import {GuiLanguage} from '../../interfaces/gui-language';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {CollectionService} from '../../services/collection/collection.service';

describe('TutorialPage', () => {
  let component: TutorialPage;
  let fixture: ComponentFixture<TutorialPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TutorialPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        SwiperModule,
        EmojiPipeModule,
        EmojiPickerModule,
        ReactiveFormsModule,
      ],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: MenuController, useClass: MockMenuController},
        {provide: EmojisMap},
        {provide: NavController, useClass: MockNavController},
        {provide: TranslateService, useClass: MockTranslateService}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable menu when entering into page', () => {
    const menuController = TestBed.inject(MenuController);
    spyOn(menuController, 'enable');
    component.ionViewDidEnter();
    expect(menuController.enable).toHaveBeenCalledWith(false);
  });

  it('should enable menu when exiting', () => {
    const menuController = TestBed.inject(MenuController);
    spyOn(menuController, 'enable');
    component.ionViewWillLeave();
    expect(menuController.enable).toHaveBeenCalledWith(true);
  });

  it('should load swiper', () => {
    component.swiper = new SwiperComponent(undefined, undefined, undefined, undefined);
    component.swiper.swiperRef = jasmine.createSpyObj({slides: [undefined, undefined], progress: 0});
    component.ngAfterContentChecked();
    expect(component.progress).not.toBeUndefined();
  });

  it('should hide and show buttons when slide changes', () => {
    // component.onSlideChange([jasmine.createSpyObj({activeIndex: () => 0, slides: () => Array(2).fill('a')})]);

    const swiper = {slides: Array(2) as any, activeIndex: 0} as SwiperCore;
    component.onSlideChange([swiper]);
    expect(component.showNextNavButton).toBeTrue();
    expect(component.showPreviousNavButton).toBeFalse();

    swiper.activeIndex = 1;
    component.onSlideChange([swiper]);
    expect(component.showNextNavButton).toBeFalse();
    expect(component.showPreviousNavButton).toBeTrue();
  });

  it('should go to next slide', () => {
    component.swiper = {} as SwiperComponent;
    component.swiper.swiperRef = jasmine.createSpyObj({slideNext: () => true});
    component.nextSlide();
    expect(component.swiper.swiperRef.slideNext).toHaveBeenCalled();
  });

  it('should go to previous slide', () => {
    component.swiper = {} as SwiperComponent;
    component.swiper.swiperRef = jasmine.createSpyObj({slidePrev: () => true});
    component.previousSlide();
    expect(component.swiper.swiperRef.slidePrev).toHaveBeenCalled();
  });

  it('should change language', () => {
    const settingsService = fixture.debugElement.injector.get(SettingsService);
    spyOn(settingsService, 'setLanguage');
    const lang: GuiLanguage = {prefix: 'fr', name: 'French'};
    component.changeLanguage({detail: {value: lang}});
    expect(settingsService.setLanguage).toHaveBeenCalledWith(lang);
  });

  it('should submit collection', async () => {
    const emoji = new Emoji('2_smile.png', '1_people');
    const collection = new Collection('a', 'b', undefined);
    collection.setId(1);

    const newValues = {
      name: 'Sample',
      prefix: 'SL',
      icon: emoji,
    };

    const navCtrl = TestBed.inject(NavController);
    const collectionService = TestBed.inject(CollectionService);
    spyOn(collectionService, 'setActiveCollection');
    spyOn(collectionService, 'addCollection').and.resolveTo(collection);

    spyOn(navCtrl, 'navigateForward');

    component.collectionForm.patchValue(newValues);
    await component.onSubmit();

    expect(collectionService.setActiveCollection).toHaveBeenCalled();
    expect(collectionService.addCollection).toHaveBeenCalledBefore(collectionService.setActiveCollection);
    expect(navCtrl.navigateForward).toHaveBeenCalledWith('/');
  });

  it('should select emoji', () => {
    const emoji = new Emoji('2_smile.png', '1_people');
    component.selectEmoji(emoji);
    expect(component.selectedEmoji).toEqual(emoji);
    expect(component.modalStatus).toBeFalse();
  });

  it('should select undefined emoji', () => {
    component.selectEmoji(undefined);
    expect(component.selectedEmoji).not.toBeUndefined();
  });

  it('should toggle modal', () => {
    const previousValue = component.modalStatus;
    component.toggleModal();
    expect(component.modalStatus === previousValue).toBeFalse();
  });
});
