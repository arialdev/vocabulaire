import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewTagPage } from './new-tag.page';

const routes: Routes = [
  {
    path: '',
    component: NewTagPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewTagPageRoutingModule {}
