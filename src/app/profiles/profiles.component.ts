import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ProfilesService } from 'src/app/profiles.service';
import type { Profiles } from 'src/app/profiles.service';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
})
export class ProfilesComponent implements OnInit, OnDestroy {
  profiles$ = this.profilesService.profiles$;

  profilesSubscription!: Subscription;

  profiles!: Profiles | undefined;

  loadedProfile!: string;

  profileToSave!: string;

  // eslint-disable-next-line no-useless-constructor
  constructor(private profilesService: ProfilesService) {}

  ngOnInit(): void {
    this.profilesSubscription = this.profiles$.subscribe({
      next: profiles => {
        this.profiles = profiles;
      },
      // eslint-disable-next-line no-console
      error: e => console.error(e),
    });
  }

  ngOnDestroy(): void {
    this.profilesSubscription.unsubscribe();
  }

  loadProfile(profileId: string): void {
    this.loadedProfile = profileId;
    this.profilesService.loadProfile(profileId);
  }

  changeProfileToSave(profileId: string): void {
    this.profileToSave = profileId;
  }

  saveProfile(): void {
    if (!this.profileToSave) {
      // eslint-disable-next-line no-alert
      alert('Choose a profile to save');
      return;
    }
    this.profilesService.saveProfile(this.profileToSave);
  }

  clearDeviceProfiles(): void {
    this.profilesService.clearDeviceProfiles();
    window.location.reload();
  }
}
