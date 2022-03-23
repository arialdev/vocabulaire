import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {CollectionService} from '../services/collection/collection.service';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ActiveCollectionGuard implements CanActivate {

  constructor(private collectionService: CollectionService, private navController: NavController) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.collectionService.getActiveCollection()
      .then(() => true)
      .catch(() => {
        this.navController.navigateForward('collections');
        return false;
      });
  }

}
