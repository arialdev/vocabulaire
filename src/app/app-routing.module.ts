import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./pages/folder/folder.module').then(m => m.FolderPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'collections',
    loadChildren: () => import('./pages/collections/collections.module').then( m => m.CollectionsPageModule)
  },
  {
    path: 'term',
    loadChildren: () => import('./pages/term/term.module').then( m => m.TermPageModule)
  },
  {
    path: 'categories/:type',
    loadChildren: () => import('./pages/categories/categories.module').then( m => m.CategoriesPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
