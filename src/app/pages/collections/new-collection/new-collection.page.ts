import {Component, OnInit} from '@angular/core';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Collection} from '../../../classes/collection/collection';
import {CollectionService} from '../../../services/collection/collection.service';
import {ActivatedRoute} from '@angular/router';
import {AlertController, NavController} from '@ionic/angular';
import {Emoji} from '../../../classes/emoji/emoji';
import {EmojiService} from '../../../services/emoji/emoji.service';

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
    private route: ActivatedRoute,
    private navCtrl: NavController,
    public alertController: AlertController,
    private emojiService: EmojiService,
  ) {
    this.collectionForm = new FormGroup({
      name: new FormControl('', Validators.required),
      prefix: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      icon: new FormControl('', Validators.required),
    });
    this.modalStatus = false;
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      await this.editMode(Number(id));
    } else {
      this.newMode();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.collectionForm.valid) {
      const collection: Collection = new Collection(
        this.collectionForm.get('name').value,
        this.collectionForm.get('prefix').value,
        this.selectedEmoji
      );
      if (this.editingId) {
        await this.collectionService.updateCollectionById(this.editingId, collection);
      } else {
        const newCollection = await this.collectionService.addCollection(collection);
        await this.collectionService.setActiveCollection(newCollection.getId());
      }
      await this.navCtrl.navigateBack('collections');
    }
  }

  selectEmoji(emoji: Emoji): void {
    if (!emoji) {
      return;
    }
    const route = this.getEmojisRoute(emoji);
    this.selectedEmoji = emoji;
    this.collectionForm.patchValue({icon: route});
    this.modalStatus = false;
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
            await this.collectionService.removeCollection(this.editingId);
            await this.navCtrl.navigateBack('collections');
          }
        }
      ]
    });

    await alert.present();
  }

  getEmojisRoute(emoji: Emoji): string {
    return this.emojiService.getEmojiRoute(emoji);
  }

  private newMode(): void {
    this.selectDefaultEmoji();
    this.title = 'New collection';
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
    this.title = 'Edit collection';
    this.editingId = id;
  }

  private selectDefaultEmoji(): void {
    this.selectEmoji(this.emojiService.getEmojiByName('smile'));
  }
}
