import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {ActiveCollectionGuard} from './guards/active-collection.guard';

const routes: Routes = [
  {
    path: 'folder/:id',
    loadChildren: () => import('./pages/folder/folder.module').then(m => m.FolderPageModule)
  },
  {
    path: '',
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
