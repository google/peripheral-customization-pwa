import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomizeButtonsComponent } from './pane/customize-buttons/customize-buttons.component';
import { AdjustDpiComponent } from './pane/adjust-dpi/adjust-dpi.component';
import { RgbProfileComponent } from './pane/rgb-profile/rgb-profile.component';

const routes: Routes = [
  { path: '', redirectTo: '/rgb', pathMatch: 'full' },
  { path: 'rgb', component: RgbProfileComponent },
  { path: 'buttons', component: CustomizeButtonsComponent },
  { path: 'dpi', component: AdjustDpiComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
