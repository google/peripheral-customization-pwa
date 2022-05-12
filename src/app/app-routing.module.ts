import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DummyComponent } from './dummy/dummy.component';
import { CustomizeButtonsComponent } from './pane/customize-buttons/customize-buttons.component';

const routes: Routes = [
  { path: '', redirectTo: '/rgb', pathMatch: 'full' },
  { path: 'rgb', component: DummyComponent },
  { path: 'buttons', component: CustomizeButtonsComponent },
  { path: 'dpi', component: DummyComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
