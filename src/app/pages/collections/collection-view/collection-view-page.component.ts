import {Component, OnInit} from '@angular/core';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Collection} from '../../../classes/collection/collection';
import {CollectionService} from '../../../services/collection/collection.service';
import {ActivatedRoute} from '@angular/router';
import {AlertController, InputCustomEvent, NavController, ToastController} from '@ionic/angular';
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

  validationMessages = {
    name: [
      {type: 'required', message: 'Collection name is required (e.g., English)'},
      {type: 'minlength', message: `Collection name must have at least ${2} characters`},
      {type: 'maxlength', message: `Collection name must have less than ${this.maxLanguageNameLength} characters`}
    ],
    prefix: [
      {type: 'required', message: 'Collection prefix is required (e.g., FR)'},
      {type: 'maxlength', message: `Collection prefix must have exactly ${2} characters (e.g., EN)`},
      {type: 'minlength', message: `Collection prefix must have exactly ${2} characters (e.g., EN)`}
    ],
    icon: [{type: 'required', message: `Choose an icon by touching the emoji icon`}]
  };
  showLength = {name: false};

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
            message: 'Collection updated successfully',
            color: 'success',
            icon: 'thumbs-up',
            duration: 800
          });
        } catch (e) {
          this.toast = await this.toastController.create({
            message: 'Could not find collection',
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
          message: 'Collection added successfully',
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
    const alert = await this.alertController.create({
      header: 'Confirm deletion',
      message: 'This action cannot be undone',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        }, {
          text: 'Delete',
          handler: async () => {
            await this.toast?.dismiss();
            try {
              await this.collectionService.removeCollection(this.editingId);
              this.toast = await this.toastController.create({
                message: 'Collection deleted successfully',
                color: 'success',
                icon: 'trash',
                duration: 800
              });
              await Promise.allSettled([this.toast.present(), this.navCtrl.navigateBack('collections')]);
            } catch (e) {
              this.toast = await this.toastController.create({
                message: e.toString() === 'Could not find collection with ID ${id}' ? 'Could not find collection' : e.toString(),
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

  generatePrefix(event: InputCustomEvent) {
    if (event.detail.value.length >= 2) {
      this.collectionForm.get('prefix').patchValue(event.detail.value.substring(0, 2).toUpperCase());
    } else {
      this.collectionForm.get('prefix').patchValue('');
      this.collectionForm.get('prefix').markAsTouched();
    }
  }

  autocapitalize(event: InputCustomEvent) {
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
