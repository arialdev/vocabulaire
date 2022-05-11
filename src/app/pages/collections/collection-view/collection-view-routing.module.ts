import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CollectionViewPage } from './collection-view-page.component';

const routes: Routes = [
  {
    path: '',
    component: CollectionViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollectionViewPageRoutingModule {}
