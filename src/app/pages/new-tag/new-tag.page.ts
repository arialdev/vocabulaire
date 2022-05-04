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

@Component({
  selector: 'app-new-tag',
  templateUrl: './new-tag.page.html',
  styleUrls: ['./new-tag.page.scss'],
})
export class NewTagPage implements OnInit {

  tagForm: FormGroup;
  selectedEmoji: Emoji;
  modalStatus: boolean;

  maxTagNameLength = 25;
  validationMessages = {
    name: [
      {type: 'required', message: 'Tag name is required (e.g., Food)'},
      {type: 'maxlength', message: `Tag name must have less than ${this.maxTagNameLength} characters`}
    ],
    icon: [{type: 'required', message: `Choose an icon by touching the emoji icon`}]
  };
  showLength = {name: false};

  private tagOptions: TagOptions;
  private toast: HTMLIonToastElement;

  constructor(
    private emojiService: EmojiService,
    private router: Router,
    private navController: NavController,
    private tagService: TagService,
    private collectionService: CollectionService,
    private toastController: ToastController
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
          message: 'Tag created successfully',
          color: 'success',
          icon: 'bookmark',
          duration: 800
        });
      } catch (e) {
        this.toast = await this.toastController.create({
          header: 'Error when creating tag',
          message: e.toString(),
          color: 'danger',
          duration: 800
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
