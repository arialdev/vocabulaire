import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {CollectionService} from '../services/collection/collection.service';
import {TagService} from '../services/tag/tag.service';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CreateTagGuard implements CanActivate {
  constructor(private collectionService: CollectionService, private navController: NavController) {
  }

  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (state.url === '/tag/new') {
      return this.collectionService.getActiveCollection().then(
        activeCollection => {
          const res = activeCollection.getTags().length < TagService.maxTagsBound;
          if (!res) {
            this.navController.navigateBack('/');
          }
          return res;
        }
      );
    } else {
      return true;
    }
  }

}
