import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {ActiveCollectionGuard} from './guards/active-collection.guard';
import {TutorialGuard} from './guards/tutorial.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    canActivate: [ActiveCollectionGuard, TutorialGuard]
  },
  {
    path: 'collections',
    loadChildren: () => import('./pages/collections/collections.module').then(m => m.CollectionsPageModule),
    canActivate: [TutorialGuard]
  },
  {
    path: 'term/new',
    loadChildren: () => import('./pages/term/term.module').then(m => m.TermPageModule),
    canActivate: [ActiveCollectionGuard, TutorialGuard]
  },
  {
    path: 'term/:id',
    loadChildren: () => import('./pages/term/term.module').then(m => m.TermPageModule),
    canActivate: [ActiveCollectionGuard, TutorialGuard]
  },
  {
    path: 'categories/:type',
    loadChildren: () => import('./pages/categories/categories.module').then(m => m.CategoriesPageModule),
    canActivate: [ActiveCollectionGuard, TutorialGuard]
  },
  {
    path: 'word-of-the-day',
    loadChildren: () => import('./pages/wod/wod.module').then(m => m.WodPageModule),
    canActivate: [ActiveCollectionGuard, TutorialGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule),
    canActivate: [ActiveCollectionGuard, TutorialGuard]
  },
  {
    path: 'tag/new',
    loadChildren: () => import('./pages/new-tag/new-tag.module').then(m => m.NewTagPageModule),
    canActivate: [ActiveCollectionGuard, TutorialGuard]
  },
  {
    path: 'tutorial',
    loadChildren: () => import('./pages/tutorial/tutorial.module').then(m => m.TutorialPageModule),
    canActivate: [TutorialGuard]
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
