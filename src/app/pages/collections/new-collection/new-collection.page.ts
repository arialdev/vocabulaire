import {Component, OnInit} from '@angular/core';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Collection} from '../../../classes/collection/collection';
import {CollectionService} from '../../../services/collection/collection.service';
import {ActivatedRoute} from '@angular/router';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-new-collection',
  templateUrl: './new-collection.page.html',
  styleUrls: ['./new-collection.page.scss'],
})
export class NewCollectionPage implements OnInit {

  collectionForm: FormGroup;
  selectedEmoji: string;
  modalStatus: boolean;
  title: string;
  private editingId: number;

  constructor(
    private collectionService: CollectionService,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {
    this.collectionForm = new FormGroup({
      name: new FormControl('', Validators.required),
      prefix: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      icon: new FormControl('', Validators.required),
    });
    this.modalStatus = false;
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.newMode();
      } else {
        this.editMode(Number(id));
      }
    });
  }

  async onSubmit() {
    if (this.collectionForm.valid) {
      const collection: Collection = new Collection(
        this.collectionForm.get('name').value,
        this.collectionForm.get('prefix').value,
        this.collectionForm.get('icon').value
      );
      if (this.editingId) {
        await this.collectionService.updateCollectionById(this.editingId, collection);
      } else {
        await this.collectionService.addCollection(collection);
      }
      await this.navCtrl.navigateBack('collections');
    }
  }

  selectEmoji(e) {
    this.selectedEmoji = e ?? this.selectedEmoji;
    this.collectionForm.patchValue({icon: this.selectedEmoji});
    this.modalStatus = false;
  }

  toggleModal() {
    this.modalStatus = !this.modalStatus;
  }

  private newMode() {
    this.selectEmoji('assets/img/emojis/people/smile.png');
    this.title = 'New collection';
    this.editingId = null;
  }

  private async editMode(id: number) {
    if (isNaN(id)) {
      return this.newMode();
    }
    const collection: Collection = await this.collectionService.getCollectionById(id);
    this.collectionForm.patchValue({
      name: collection.language.name,
      prefix: collection.language.prefix,
      icon: collection.language.icon
    });
    this.selectEmoji(collection.language.icon);
    this.title = 'Edit collection';
    this.editingId = id;
  }
}
