import {Component, OnInit} from '@angular/core';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Collection} from '../../../classes/collection/collection';
import {CollectionService} from '../../../services/collection/collection.service';
import {ActivatedRoute} from '@angular/router';
import {AlertController, NavController, ToastController} from '@ionic/angular';
import {Emoji} from '../../../classes/emoji/emoji';
import {EmojiService} from '../../../services/emoji/emoji.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-new-collection',
  templateUrl: './collection-view-page.component.html',
  styleUrls: ['./collection-view-page.component.scss'],
})
export class CollectionViewPage implements OnInit {

  collectionForm: FormGroup;
  selectedEmoji: Emoji;
  modalStatus: boolean;
  title: string;
  editingId: number;
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
      name: 'collections.form.name',
    }
  };

  private toast: HTMLIonToastElement;

  constructor(
    private collectionService: CollectionService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    public alertController: AlertController,
    private emojiService: EmojiService,
    private translateService: TranslateService,
    private toastController: ToastController
  ) {
    this.collectionForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(this.maxLanguageNameLength)
      ]),
      prefix: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2)
      ]),
      icon: new FormControl('', Validators.required),
    });
    this.modalStatus = false;
  }

  async ngOnInit(): Promise<void> {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      await this.editMode(Number(id));
    } else {
      await this.newMode();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.collectionForm.valid) {
      const collection: Collection = new Collection(
        this.collectionForm.get('name').value,
        this.collectionForm.get('prefix').value,
        this.selectedEmoji
      );
      await this.toast?.dismiss();
      if (this.editingId) {
        try {
          await this.collectionService.updateCollectionById(this.editingId, collection);
          this.toast = await this.toastController.create({
            message: await this.translateService.get('collections.toast.update.success.msg').toPromise(),
            color: 'success',
            icon: 'thumbs-up',
            duration: 800
          });
        } catch (e) {
          this.toast = await this.toastController.create({
            message: await this.translateService.get('collections.toast.update.error-no-collection.msg').toPromise(),
            color: 'danger',
            icon: 'alert-circle',
            duration: 1000
          });
          return this.toast.present();
        }
      } else {
        const newCollection = await this.collectionService.addCollection(collection);
        await this.collectionService.setActiveCollection(newCollection.getId());
        this.toast = await this.toastController.create({
          message: await this.translateService.get('collections.toast.create.success.msg').toPromise(),
          color: 'success',
          icon: 'thumbs-up',
          duration: 800
        });
      }
      await Promise.allSettled([this.toast.present(), this.navCtrl.navigateBack('collections')]);
    } else {
      this.collectionForm.markAllAsTouched();
    }
  }

  selectEmoji(emoji: Emoji): void {
    this.modalStatus = false;
    if (!emoji) {
      return;
    }
    const route = this.getEmojisRoute(emoji);
    this.selectedEmoji = emoji;
    this.collectionForm.patchValue({icon: route});
  }

  toggleModal(): void {
    this.modalStatus = !this.modalStatus;
  }

  async openDeletionAlert(): Promise<void> {
    const text = await this.translateService.get('collections.alert.deletion').toPromise();
    const alert = await this.alertController.create({
      header: text.header,
      message: text.msg,
      buttons: [
        {
          text: text.cancel,
          role: 'cancel',
        }, {
          text: text.ok,
          handler: async () => {
            await this.toast?.dismiss();
            try {
              await this.collectionService.removeCollection(this.editingId);
              this.toast = await this.toastController.create({
                message: await this.translateService.get('collections.toast.delete.success.msg').toPromise(),
                color: 'success',
                icon: 'trash',
                duration: 800
              });
              await Promise.allSettled([this.toast.present(), this.navCtrl.navigateBack('collections')]);
            } catch (e) {
              let message: string;
              if (e.message === `Could not find collection with ID ${this.editingId}`) {
                message = 'collections.toast.delete.error-no-collection.msg';
              } else if (e.message === 'Cannot delete active collection') {
                message = 'collections.toast.delete.error-active.msg';
              } else {
                message = 'collections.toast.delete.error.msg';
              }
              this.toast = await this.toastController.create({
                message: await this.translateService.get(message).toPromise(),
                color: 'danger',
                icon: 'alert-circle',
                duration: 1000
              });
              await this.toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getEmojisRoute(emoji: Emoji): string {
    return this.emojiService.getEmojiRoute(emoji);
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

  private async newMode(): Promise<void> {
    this.selectDefaultEmoji();
    this.title = await this.translateService.get('collections.form.title-new').toPromise();
    this.editingId = null;
  }

  private async editMode(id: number): Promise<void> {
    if (isNaN(id)) {
      return this.newMode();
    }
    const collection: Collection = await this.collectionService.getCollectionById(id);
    this.collectionForm.patchValue({
      name: collection.getLanguage().getName(),
      prefix: collection.getLanguage().getPrefix(),
      icon: collection.getLanguage().getIcon()
    });
    this.selectEmoji(collection.getLanguage().getIcon());
    this.title = await this.translateService.get('collections.form.title-edit').toPromise();
    this.editingId = id;
  }

  private selectDefaultEmoji(): void {
    this.selectEmoji(this.emojiService.getEmojiByName('2_smile.png'));
  }
}
