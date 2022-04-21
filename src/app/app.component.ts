import {Component, OnInit} from '@angular/core';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {SettingsService} from './services/settings/settings.service';
import {CollectionService} from './services/collection/collection.service';
import {Tag} from './classes/tag/tag';
import {Emoji} from './classes/emoji/emoji';
import {TagOptions} from './classes/tagOptions/tag-options';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public tags: Tag[];
  maxTagsBound: number;

  constructor(
    private storageService: AbstractStorageService,
    private settingsService: SettingsService,
    private collectionService: CollectionService
  ) {
    this.tags = [];
    this.maxTagsBound = CollectionService.maxTagsBound;
  }

  async ngOnInit(): Promise<void> {
    await this.loadTheme();
  }

  async loadTags() {
    // this.tags = (await this.collectionService.getActiveCollection()).getTags();
    const fakeTags: Tag[] = [
      new Tag('hola', new Emoji('1645_fr.png', '8_flags'), new TagOptions('hola')),
      new Tag('canoa', new Emoji('841_canoe.png', '5_activities'), new TagOptions('hola')),
      new Tag('gente', new Emoji('841_canoe.png', '5_activities'), new TagOptions('hola'))
    ];
    this.tags = fakeTags;
  }

  private async loadTheme() {
    await this.settingsService.loadTheme();
  }
}
