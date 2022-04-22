import {Component, OnInit} from '@angular/core';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {SettingsService} from './services/settings/settings.service';
import {CollectionService} from './services/collection/collection.service';
import {Tag} from './classes/tag/tag';

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
    this.tags = (await this.collectionService.getActiveCollection()).getTags();
  }

  private async loadTheme() {
    await this.settingsService.loadTheme();
  }
}
