import {Component, OnInit} from '@angular/core';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {SettingsService} from './services/settings/settings.service';
import {CollectionService} from './services/collection/collection.service';
import {Tag} from './classes/tag/tag';
import {MenuController, NavController} from '@ionic/angular';
import {TagService} from './services/tag/tag.service';

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
    private collectionService: CollectionService,
    private navController: NavController,
    private menuController: MenuController
  ) {
    this.tags = [];
    this.maxTagsBound = TagService.maxTagsBound;
  }

  async ngOnInit(): Promise<void> {
    await this.loadTheme();
  }

  async loadTags() {
    this.tags = (await this.collectionService.getActiveCollection()).getTags();
  }

  async loadTag(tag: Tag) {
    TagService.loadTag(tag);
    await this.menuController.close();
  }

  private async loadTheme() {
    await this.settingsService.loadTheme();
  }
}
