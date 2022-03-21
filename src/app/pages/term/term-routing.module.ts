import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {TermPage} from './term.page';

const routes: Routes = [
  {
    path: '',
    component: TermPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermPageRoutingModule {
}
