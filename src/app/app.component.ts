import {Component, OnInit} from '@angular/core';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {SettingsService} from './services/settings/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public tags = ['Verbs', 'Swearing'];

  constructor(
    private storageService: AbstractStorageService,
    private settingsService: SettingsService
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.loadTheme();
  }

  private async loadTheme() {
    await this.settingsService.loadTheme();
  }
}
