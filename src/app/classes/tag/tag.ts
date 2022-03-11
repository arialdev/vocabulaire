import {TagOptions} from '../tagOptions/tag-options';
import {StoringItem} from '../storing-item';

export class Tag extends StoringItem {
  private name: string;
  private icon: string;
  private options: TagOptions;

  constructor(name: string, icon: string, options: TagOptions) {
    super();
    this.name = name;
    this.icon = icon;
    this.options = options;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    this.updateUpdatedTime();
  }

  public getIcon(): string {
    return this.icon;
  }

  public setIcon(icon: string): void {
    this.icon = icon;
    this.updateUpdatedTime();
  }

  public getOptions(): TagOptions {
    return this.options;
  }

  public setOptions(options: TagOptions): void {
    this.options = options;
    this.updateUpdatedTime();
  }
}
