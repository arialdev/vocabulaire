import {Component, OnInit} from '@angular/core';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public tags = ['Verbs', 'Swearing'];

  constructor(private storageService: AbstractStorageService, private translateService: TranslateService) {
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadTheme(), this.setLanguage()]);
  }

  private async loadTheme() {
    const settings = await this.storageService.get('settings');
    if (settings.darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }

  private async setLanguage() {
    this.translateService.setDefaultLang('es');
  }
}
