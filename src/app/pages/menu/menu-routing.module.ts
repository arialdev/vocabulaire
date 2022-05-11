import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {MenuPage} from './menu.page';
import {ActiveCollectionGuard} from '../../guards/active-collection.guard';
import {TutorialGuard} from '../../guards/tutorial.guard';
import {CreateTagGuard} from '../../guards/create-tag.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '',
    component: MenuPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule),
        canActivate: [ActiveCollectionGuard, TutorialGuard]
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule),
        canActivate: [ActiveCollectionGuard, TutorialGuard]
      },
      {
        path: 'word-of-the-day',
        loadChildren: () => import('../wod/wod.module').then(m => m.WodPageModule),
        canActivate: [ActiveCollectionGuard, TutorialGuard]
      },
      {
        path: 'collections',
        loadChildren: () => import('../collections/collections.module').then(m => m.CollectionsPageModule),
        canActivate: [TutorialGuard]
      },
      {
        path: 'term/new',
        loadChildren: () => import('../term/term.module').then(m => m.TermPageModule),
        canActivate: [ActiveCollectionGuard, TutorialGuard]
      },
      {
        path: 'term/:id',
        loadChildren: () => import('../term/term.module').then(m => m.TermPageModule),
        canActivate: [ActiveCollectionGuard, TutorialGuard]
      },
      {
        path: 'categories/:type',
        loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesPageModule),
        canActivate: [ActiveCollectionGuard, TutorialGuard]
      },
      {
        path: 'tag/new',
        loadChildren: () => import('../new-tag/new-tag.module').then(m => m.NewTagPageModule),
        canActivate: [ActiveCollectionGuard, TutorialGuard, CreateTagGuard]
      },
      {
        path: 'tutorial',
        loadChildren: () => import('../tutorial/tutorial.module').then(m => m.TutorialPageModule),
        canActivate: [TutorialGuard]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPageRoutingModule {
}
