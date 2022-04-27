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
  templateUrl: './new-collection.page.html',
  styleUrls: ['./new-collection.page.scss'],
})
export class NewCollectionPage implements OnInit {

  collectionForm: FormGroup;
  selectedEmoji: Emoji;
  modalStatus: boolean;
  title: string;
  editingId: number;

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
      name: new FormControl('', Validators.required),
      prefix: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
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
      let toast: HTMLIonToastElement;
      if (this.editingId) {
        try {
          await this.collectionService.updateCollectionById(this.editingId, collection);
          toast = await this.toastController.create({
            message: 'Collection updated successfully',
            color: 'success',
            icon: 'thumbs-up',
            duration: 800
          });
        } catch (e) {
          toast = await this.toastController.create({
            message: 'Could not find collection',
            color: 'danger',
            icon: 'alert-circle',
            duration: 1000
          });
          return toast.present();
        }
      } else {
        const newCollection = await this.collectionService.addCollection(collection);
        await this.collectionService.setActiveCollection(newCollection.getId());
        toast = await this.toastController.create({
          message: 'Collection added successfully',
          color: 'success',
          icon: 'thumbs-up',
          duration: 800
        });
      }
      await Promise.allSettled([toast.present(), this.navCtrl.navigateBack('collections')]);
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
            let toast: HTMLIonToastElement;
            try {
              await this.collectionService.removeCollection(this.editingId);
              toast = await this.toastController.create({
                message: 'Collection deleted successfully',
                color: 'success',
                icon: 'trash',
                duration: 800
              });
              await Promise.allSettled([toast.present(), this.navCtrl.navigateBack('collections')]);
            } catch (e) {
              toast = await this.toastController.create({
                message: e.toString() === 'Could not find collection with ID ${id}' ? 'Could not find collection' : e.toString(),
                color: 'danger',
                icon: 'alert-circle',
                duration: 1000
              });
              await toast.present();
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
