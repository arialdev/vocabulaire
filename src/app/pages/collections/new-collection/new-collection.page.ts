import {Component, OnInit} from '@angular/core';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Collection} from '../../../classes/collection/collection';
import {CollectionService} from '../../../services/collection/collection.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-collection',
  templateUrl: './new-collection.page.html',
  styleUrls: ['./new-collection.page.scss'],
})
export class NewCollectionPage implements OnInit {

  collectionForm: FormGroup;
  selectedEmoji: string;
  modalStatus: boolean;

  constructor(private collectionService: CollectionService, public router: Router) {
    this.collectionForm = new FormGroup({
      name: new FormControl('', Validators.required),
      prefix: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      icon: new FormControl('', Validators.required),
    });
    this.modalStatus = false;
  }

  ngOnInit() {
    this.selectEmoji('assets/img/emojis/people/smile.png');
  }

  async onSubmit() {
    if (this.collectionForm.valid) {
      const collection: Collection = new Collection(
        this.collectionForm.get('name').value,
        this.collectionForm.get('prefix').value,
        this.collectionForm.get('icon').value
      );
      await this.collectionService.addCollection(collection);
      await this.router.navigate(['collections']);
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
}
