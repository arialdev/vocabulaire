import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewCollectionPage } from './new-collection.page';

const routes: Routes = [
  {
    path: '',
    component: NewCollectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewCollectionPageRoutingModule {}
