import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {CollectionsPage} from './collections.page';

const routes: Routes = [
  {
    path: '',
    component: CollectionsPage
  },
  {
    path: ':id',
    loadChildren: () => import('./collection-view/collection-view.module').then(m => m.CollectionViewPageModule)
  },
  {
    path: 'new',
    loadChildren: () => import('./collection-view/collection-view.module').then(m => m.CollectionViewPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollectionsPageRoutingModule {
}
