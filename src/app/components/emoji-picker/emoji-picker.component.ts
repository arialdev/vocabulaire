import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss'],
})
export class EmojiPickerComponent implements OnInit {

  emojis: string[];

  constructor() {
    this.emojis = new Array(50).fill('assets/img/emojis/cn.png');
  }

  ngOnInit() {
  }

  setEmoji() {
    console.log(1);
  }

}
