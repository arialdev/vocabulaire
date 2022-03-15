import {StoringItem} from '../storing-item';
import {Emoji} from '../emoji/emoji';

export class Language extends StoringItem {
  private name: string;
  private prefix: string;
  private icon: Emoji;

  constructor(languageData: any);
  constructor(name: string, prefix: string, icon: Emoji);
  constructor(language: string | any, prefix?: string, icon?: Emoji) {

    if (typeof language === 'string') {
      super();
      this.name = language;
      this.prefix = prefix.toUpperCase();
      this.icon = icon;
    } else {
      super(language.id, language.status, language.createdAt, language.updatedAt);
      this.name = language.name;
      this.prefix = language.prefix;
      this.icon = new Emoji(language.icon);
    }
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    this.updateUpdatedTime();
  }

  public getPrefix(): string {
    return this.prefix;
  }

  public setPrefix(prefix: string): void {
    this.prefix = prefix.toUpperCase();
    this.updateUpdatedTime();
  }

  public getIcon(): Emoji {
    return this.icon;
  }

  public setIcon(icon: Emoji): void {
    this.icon = icon;
    this.updateUpdatedTime();
  }
}
