import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {EmojiService} from '../../services/emoji/emoji.service';
import {Emoji} from '../../classes/emoji/emoji';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss'],
})
export class EmojiPickerComponent implements OnInit {

  @Output() newEmojiEvent: EventEmitter<Emoji>;
  selectedEmoji: Emoji;
  categories: string[];
  emojis;
  selectedCategory: string;

  constructor(public emojiService: EmojiService) {
    this.newEmojiEvent = new EventEmitter<Emoji>();
  }

  ngOnInit() {
    this.categories = this.emojiService.getCategories();
    this.selectedCategory = this.categories[0];
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  setEmoji(emoji: Emoji) {
    this.selectedEmoji = emoji;
    this.newEmojiEvent.emit(emoji);
  }

  closeModal() {
    this.newEmojiEvent.emit(this.selectedEmoji);
  }

  getEmojisFromCategory(category: string) {
    return this.emojiService.getEmojisFromCategory(category);
  }
}
