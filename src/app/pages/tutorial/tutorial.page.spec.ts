import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {InputCustomEvent, IonicModule, MenuController, NavController} from '@ionic/angular';

import {TutorialPage} from './tutorial.page';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {MockMenuController, MockNavController} from '../../../mocks';
import {EmojisMap} from '../../services/emoji/emojisMap';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';
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
        TranslateModule.forRoot()
      ],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: MenuController, useClass: MockMenuController},
        {provide: EmojisMap},
        {provide: NavController, useClass: MockNavController},
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

  it('should load default language', async () => {
    const settingsService = TestBed.inject(SettingsService);
    const settingsSpy = spyOn(settingsService, 'getPreferredLanguage').and.resolveTo(undefined);
    await component.ionViewWillEnter();
    expect(component.preferredLanguage).toBeTruthy();
    expect(settingsService.getPreferredLanguage).toHaveBeenCalled();
    settingsSpy.and.resolveTo({prefix: 'fr', name: 'French'});
    await component.ionViewWillEnter();
    expect(component.preferredLanguage).toBeTruthy();
    expect(settingsService.getPreferredLanguage).toHaveBeenCalled();
  });

  it('should compare languages', () => {
    const lan1: GuiLanguage = {prefix: 'fr', name: 'French'};
    const lan2: GuiLanguage = {prefix: 'es', name: 'Español'};
    component.languages = [lan1, lan2];
    expect(component.compareWith(lan1, lan2)).toBeFalse();
    expect(component.compareWith(lan1, lan1)).toBeTrue();
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

  it('should mark input as touched when trying to submit wrong data', async () => {
    await component.onSubmit();
    expect(component.collectionForm.get('name').touched).toBeTrue();
    expect(component.collectionForm.get('prefix').touched).toBeTrue();
  });

  it('should display length on focus', () => {
    expect(component.showLength.name).toBeFalse();
    component.inputOnFocus('name');
    expect(component.showLength.name).toBeTrue();
  });

  it('should not display length on blur', () => {
    component.showLength.name = true;
    component.inputOnBlur('name');
    expect(component.showLength.name).toBeFalse();
  });

  it('should generate automatically collection prefix when setting name', () => {
    const event: InputCustomEvent = {detail: {value: 'hola'}} as InputCustomEvent;
    expect(component.collectionForm.get('prefix').value).toBeFalsy();
    component.generatePrefix(event);
    expect(component.collectionForm.get('prefix').value).toBeTruthy();
  });

  it('should delete collection prefix when setting short name', () => {
    expect(component.collectionForm.get('prefix').touched).toBeFalse();
    expect(component.collectionForm.get('prefix').value).toBeFalsy();
    component.generatePrefix({detail: {value: 'h'}} as InputCustomEvent);
    expect(component.collectionForm.get('prefix').value).toBeFalsy();
    expect(component.collectionForm.get('prefix').touched).toBeTrue();

    component.generatePrefix({detail: {value: ''}} as InputCustomEvent);
    expect(component.collectionForm.get('prefix').value).toBeFalsy();

    component.generatePrefix({detail: {value: 'hola'}} as InputCustomEvent);
    expect(component.collectionForm.get('prefix').value).toBeTruthy();
  });

  it('should autocapitalize', () => {
    component.autocapitalize({detail: {value: 'ho'}} as InputCustomEvent);
    expect(component.collectionForm.get('prefix').value).toEqual('HO');
    component.autocapitalize({detail: {value: 'JA'}} as InputCustomEvent);
    expect(component.collectionForm.get('prefix').value).toEqual('JA');
  });
});
