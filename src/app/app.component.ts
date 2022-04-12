import {Component, OnInit} from '@angular/core';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {TranslateService} from '@ngx-translate/core';
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
    private translateService: TranslateService,
    private settingsService: SettingsService
  ) {
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadTheme(), this.setLanguage()]);
  }

  private async loadTheme() {
    await this.settingsService.loadTheme();
  }

  private async setLanguage() {
    this.translateService.setDefaultLang('es');
  }
}
