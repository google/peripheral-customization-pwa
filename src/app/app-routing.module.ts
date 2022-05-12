import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DummyComponent } from './dummy/dummy.component';
import { CustomizeButtonsComponent } from './pane/customize-buttons/customize-buttons.component';
import { AdjustDpiComponent } from './pane/adjust-dpi/adjust-dpi.component';

const routes: Routes = [
  { path: '', redirectTo: '/rgb', pathMatch: 'full' },
  { path: 'rgb', component: DummyComponent },
  { path: 'buttons', component: CustomizeButtonsComponent },
  { path: 'dpi', component: AdjustDpiComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
