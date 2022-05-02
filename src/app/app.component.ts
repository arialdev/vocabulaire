import {Component} from '@angular/core';
import {SettingsService} from './services/settings/settings.service';
import {ScreenOrientation} from '@awesome-cordova-plugins/screen-orientation/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private settingsService: SettingsService, private screenOrientation: ScreenOrientation) {
    Promise.allSettled([this.lockPortraitOrientation(), this.loadTheme()]);
  }

  private async lockPortraitOrientation(): Promise<void> {
    return this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  private async loadTheme(): Promise<void> {
    return this.settingsService.loadTheme();
  }
}
