import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {ActiveCollectionGuard} from './guards/active-collection.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    canActivate: [ActiveCollectionGuard]
  },
  {
    path: 'collections',
    loadChildren: () => import('./pages/collections/collections.module').then(m => m.CollectionsPageModule)
  },
  {
    path: 'term/new',
    loadChildren: () => import('./pages/term/term.module').then(m => m.TermPageModule),
    canActivate: [ActiveCollectionGuard]
  },
  {
    path: 'term/:id',
    loadChildren: () => import('./pages/term/term.module').then(m => m.TermPageModule),
  },
  {
    path: 'categories/:type',
    loadChildren: () => import('./pages/categories/categories.module').then(m => m.CategoriesPageModule),
    canActivate: [ActiveCollectionGuard]
  },
  {
    path: 'word-of-the-day',
    loadChildren: () => import('./pages/wod/wod.module').then(m => m.WodPageModule),
    canActivate: [ActiveCollectionGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule),
    canActivate: [ActiveCollectionGuard]
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
