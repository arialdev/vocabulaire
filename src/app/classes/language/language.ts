import {StoringItem} from '../storing-item';

export class Language extends StoringItem {
  private name: string;
  private prefix: string;
  private icon: string;

  constructor(languageData: any);
  constructor(name: string, prefix: string, icon: string);
  constructor(language: string | any, prefix?: string, icon?: string) {

    if (typeof language === 'string') {
      super();
      this.name = language;
      this.prefix = prefix.toUpperCase();
      this.icon = icon;
    } else {
      super(language.id, language.status, language.createdAt, language.updatedAt);
      this.name = language.name;
      this.prefix = language.prefix;
      this.icon = language.icon;
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

  public getIcon(): string {
    return this.icon;
  }

  public setIcon(icon: string): void {
    this.icon = icon;
    this.updateUpdatedTime();
  }
}
