import {Injectable} from '@angular/core';
import {EmojisMap} from './emojisMap';
import {Emoji} from '../../classes/emoji/emoji';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {

  private readonly emojiRoute: string = 'assets/img/emojis/**/*.png';
  private readonly headerEmojiRoute: string = 'assets/img/emojis/categories/*.svg';
  private readonly categoryMap: object;            //maps a category with its emojis names
  private emojisMap: Map<string, Emoji>;           //maps an id with its emoji object

  constructor(emojisMap: EmojisMap) {
    this.categoryMap = emojisMap.emojisMap;
    this.emojisMap = new Map<string, Emoji>();
    Object.entries(this.categoryMap).forEach(entry => {
      for (const emoji of entry[1]) {
        this.emojisMap.set(emoji, new Emoji(emoji, entry[0]));
      }
    });
  }

  public getCategories(): string[] {
    return Object.keys(this.categoryMap);
  }

  public getEmojisFromCategory(category: string): Emoji[] {
    return this.categoryMap[category].map(e => this.getEmojiByName(e));
  }

  public getEmojiByName(emojiName: string): Emoji | undefined {
    return this.emojisMap.get(emojiName);
  }

  public getCategoryPic(category: string): string {
    return this.headerEmojiRoute.replace('*', category);
  }

  public getEmojiRoute(emoji: Emoji): string | undefined {
    if (!emoji || !this.emojisMap.get(emoji.getName())) {
      return;
    }
    return this.emojiRoute.replace('**', emoji.getCategory()).replace('*.', `${emoji.getName()}.`);
  }

}
