import {TagOptions} from '../tagOptions/tag-options';
import {StoringItem} from '../storing-item';
import {Emoji} from '../emoji/emoji';

export class Tag extends StoringItem {
  private name: string;
  private icon: Emoji;
  private options: TagOptions;

  constructor(tagData);
  constructor(name: string, icon: Emoji, options: TagOptions);
  constructor(data: string | any, icon?: Emoji, options?: TagOptions) {
    if (typeof data === 'string') {
      super();
      this.name = data;
      this.icon = icon;
      this.options = options;
    } else {
      super(data.id, data.status, data.createdAt, data.updatedAt);
      this.name = data.name;
      this.icon = new Emoji(data.icon);
      this.options = new TagOptions(data.options);
    }
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    this.updateUpdatedTime();
  }

  public getIcon(): Emoji {
    return this.icon;
  }

  public setIcon(icon: Emoji): void {
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
