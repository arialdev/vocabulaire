import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WodPage } from './wod.page';

const routes: Routes = [
  {
    path: '',
    component: WodPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WodPageRoutingModule {}
