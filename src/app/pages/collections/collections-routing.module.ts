import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CollectionsPage } from './collections.page';

const routes: Routes = [
  {
    path: '',
    component: CollectionsPage
  },
  {
    path: 'new',
    loadChildren: () => import('./new-collection/new-collection.module').then( m => m.NewCollectionPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollectionsPageRoutingModule {}
