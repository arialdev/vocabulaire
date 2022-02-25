import {Component, OnInit} from '@angular/core';
import {FormGroup, Validators, FormControl} from '@angular/forms';

@Component({
  selector: 'app-new-collection',
  templateUrl: './new-collection.page.html',
  styleUrls: ['./new-collection.page.scss'],
})
export class NewCollectionPage implements OnInit {

  collectionForm: FormGroup;
  selectedEmoji: string;
  modalStatus: boolean;

  constructor() {
    this.collectionForm = new FormGroup({
      name: new FormControl('', Validators.required),
      prefix: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      icon: new FormControl('', Validators.required),
    });
    this.modalStatus = false;
  }

  ngOnInit() {
    this.selectedEmoji = 'assets/img/emojis/people/smile.png';
  }


  saveCollection() {
  }

  onSubmit() {
    console.log(this.collectionForm.status);
  }

  selectEmoji(e) {
    this.selectedEmoji = e ?? this.selectedEmoji;
    this.modalStatus = false;
  }

  toggleModal() {
    this.modalStatus = !this.modalStatus;
  }
}
