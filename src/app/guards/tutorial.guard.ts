import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {NavController} from '@ionic/angular';
import {SettingsService} from '../services/settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class TutorialGuard implements CanActivate {

  constructor(private settingsService: SettingsService, private navController: NavController) {
  }

  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.settingsService.isInitialized().then(initialized => {
      if (initialized && state.url === '/tutorial') {
        this.navController.navigateRoot('/');
        return false;
      } else if (!initialized && state.url !== '/tutorial') {
        this.navController.navigateRoot('/tutorial');
        return false;
      }
      return true;
    });

  }

}
