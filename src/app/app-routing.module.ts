import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomizeButtonsComponent } from './pane/customize-buttons/customize-buttons.component';
import { AdjustCpiComponent } from './pane/adjust-cpi/adjust-cpi.component';
import { RgbProfileComponent } from './pane/rgb-profile/rgb-profile.component';
import { ProfilesComponent } from './profiles/profiles.component';

const routes: Routes = [
  { path: '', redirectTo: '/rgb', pathMatch: 'full' },
  { path: 'rgb', component: RgbProfileComponent },
  { path: 'buttons', component: CustomizeButtonsComponent },
  { path: 'cpi', component: AdjustCpiComponent },
  { path: 'profiles', component: ProfilesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
