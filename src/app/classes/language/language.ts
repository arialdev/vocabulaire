import {StoringItem} from '../storing-item';

export class Language extends StoringItem {
  private name: string;
  private prefix: string;
  private icon: string;

  constructor(name: string, prefix: string, icon: string) {
    super();
    this.name = name;
    this.prefix = prefix.toUpperCase();
    this.icon = icon;
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
