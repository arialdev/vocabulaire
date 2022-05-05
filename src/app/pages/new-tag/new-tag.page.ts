import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Emoji} from '../../classes/emoji/emoji';
import {EmojiService} from '../../services/emoji/emoji.service';
import {Router} from '@angular/router';
import {TagOptions} from '../../classes/tagOptions/tag-options';
import {NavController, ToastController} from '@ionic/angular';
import {Tag} from '../../classes/tag/tag';
import {TagService} from '../../services/tag/tag.service';
import {CollectionService} from '../../services/collection/collection.service';
import {Collection} from '../../classes/collection/collection';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-new-tag',
  templateUrl: './new-tag.page.html',
  styleUrls: ['./new-tag.page.scss'],
})
export class NewTagPage implements OnInit {

  tagForm: FormGroup;
  selectedEmoji: Emoji;
  modalStatus: boolean;

  maxTagNameLength = 30;
  validationMessages = {
    name: [
      {type: 'required', message: 'tag.form.validation.name.required'},
      {type: 'maxlength', message: `tag.form.validation.name.maxlength`}
    ],
    icon: [{type: 'required', message: 'tag.form.validation.icon.required'}]
  };
  showLength = {name: false};

  readonly translation = {
    name: 'tag.form.name'
  };

  private tagOptions: TagOptions;
  private toast: HTMLIonToastElement;

  constructor(
    private emojiService: EmojiService,
    private router: Router,
    private navController: NavController,
    private tagService: TagService,
    private collectionService: CollectionService,
    private toastController: ToastController,
    private translationService: TranslateService
  ) {
    this.tagForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(this.maxTagNameLength)]),
      icon: new FormControl('', Validators.required),
    });
    this.modalStatus = false;
    this.selectEmoji(this.emojiService.getEmojiByName('2_smile.png'));
  }

  async ngOnInit() {
    try {
      this.tagOptions = this.router.getCurrentNavigation().extras.state.tagOptions;
    } catch (_) {
      await this.navController.navigateBack('/');
    }
  }

  async onSubmit() {
    if (this.tagForm.valid) {
      const tag = new Tag(this.tagForm.get('name').value, this.tagForm.get('icon').value, this.tagOptions);
      const activeCollection: Collection = await this.collectionService.getActiveCollection();
      await this.toast?.dismiss();
      try {
        await this.tagService.addTag(tag, activeCollection.getId());
        this.toast = await this.toastController.create({
          message: await this.translationService.get('tag.toast.success.msg').toPromise(),
          color: 'success',
          icon: 'bookmark',
          duration: 800
        });
      } catch (e) {
        let message;
        if (e.message === `Collection with ID ${activeCollection.getId()} not found`) {
          message = 'tag.toast.fail.no-active-collection.msg';
        } else {
          message = e.message;
        }
        this.toast = await this.toastController.create({
          header: await this.translationService.get('tag.toast.fail.max-reached.header').toPromise(),
          message: await this.translationService.get(message).toPromise(),
          color: 'danger',
          duration: 1000
        });
      }
      TagService.loadTag(tag);
      await Promise.allSettled([this.navController.navigateBack('/'), this.toast.present()]);
    } else {
      this.tagForm.markAllAsTouched();
    }
  }

  toggleModal(): void {
    this.modalStatus = !this.modalStatus;
  }

  selectEmoji(emoji: Emoji): void {
    this.modalStatus = false;
    if (!emoji) {
      return;
    }
    this.selectedEmoji = emoji;
    this.tagForm.patchValue({icon: emoji});
  }

  inputOnFocus(formControlName: string): void {
    this.showLength[formControlName] = true;
  }

  inputOnBlur(formControlName: string): void {
    this.showLength[formControlName] = false;
  }
}
