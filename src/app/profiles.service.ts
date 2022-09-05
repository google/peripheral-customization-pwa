import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { InputBindings } from 'src/lib/ts/devices/components/inputs';
import { CPICapabilities } from 'src/lib/ts/devices/components/cpi';
import { ManagerService } from './manager.service';

enum ErrorMessages {
  CONSTRUCTOR = "Couldn't get device profiles",
  CREATE = "Couldn't create device profiles",
  SAVE = "Couldn't save the profile",
  INPUT = "Couldn't get current input bindings",
  CPI = "Coudn't get current cpi",
}

type InvertedLevels = Record<number, number>;

interface CpiProfile {
  stages: number[];
  stage: number;
}

export interface Profile {
  deviceId: string;
  cpiProfile: CpiProfile;
  inputProfile: InputBindings;
}

export type Profiles = Record<string, Profile>;

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  profilesSubject = new BehaviorSubject<Profiles | undefined>(undefined);

  maxProfiles = 3;

  deviceId!: string;

  cpiCapabilities!: CPICapabilities;

  invertedLevels!: InvertedLevels;

  constructor(private manager: ManagerService) {
    try {
      const vendorId = this.manager.device?.hidDevice.vendorId ?? 0;
      const productId = this.manager.device?.hidDevice.productId ?? 0;

      if (!this.manager.cpiCapabilities) return;
      this.cpiCapabilities = this.manager.cpiCapabilities;
      this.invertedLevels = Object.entries(this.cpiCapabilities.levels).reduce(
        (acc, [key, value]) => {
          acc[value] = parseInt(key, 10);
          return acc;
        },
        {} as InvertedLevels,
      );

      this.deviceId = `${vendorId}:${productId}`;
      const rawProfiles = localStorage.getItem(this.deviceId);

      if (rawProfiles) {
        this.profilesSubject.next(JSON.parse(rawProfiles));
      } else {
        this.createProfilesForDevice(this.deviceId).then(profiles => {
          this.profilesSubject.next(profiles);
        });
      }
    } catch (e) {
      throw new Error(ErrorMessages.CONSTRUCTOR);
    }
  }

  get profiles$(): Observable<Profiles | undefined> {
    return this.profilesSubject.asObservable();
  }

  get profiles(): Profiles | undefined {
    return this.profilesSubject.getValue();
  }

  private async createProfilesForDevice(deviceId: string): Promise<Profiles> {
    try {
      const profile = {
        deviceId,
        inputProfile: await this.getCurrentInputBinding(),
        cpiProfile: await this.getCurrentCpi(),
      };
      const profiles: Profiles = {
        'Profile 1': profile,
        'Profile 2': profile,
        'Profile 3': profile,
      };

      localStorage.setItem(deviceId, JSON.stringify(profiles));

      return profiles;
    } catch (e) {
      throw new Error(ErrorMessages.CREATE);
    }
  }

  async saveProfile(profileId: string): Promise<void> {
    try {
      const newProfile = {
        deviceId: this.deviceId,
        inputProfile: await this.getCurrentInputBinding(),
        cpiProfile: await this.getCurrentCpi(),
      };

      if (this.profiles) this.profiles[profileId] = newProfile;

      localStorage.setItem(this.deviceId, JSON.stringify(this.profiles));
    } catch (e) {
      throw new Error(ErrorMessages.SAVE);
    }
  }

  loadProfile(profileId: string): void {
    this.loadInput(profileId);
    this.loadCpi(profileId);
  }

  clearDeviceProfiles(): void {
    // eslint-disable-next-line no-console
    console.log(`Profile for ${this.deviceId} cleared`);
    localStorage.removeItem(this.deviceId);
  }

  private loadInput(profileId: string): void {
    if (!this.profiles) return;
    const profileInputBindings = this.profiles[profileId].inputProfile;
    this.getCurrentInputBinding().then(currentInputbinding => {
      Object.entries(profileInputBindings).forEach(([_, binding]) => {
        if (binding.bindTo.key === currentInputbinding[binding.key]?.bindTo.key)
          return;
        this.manager.setInput(binding);
      });
    });
  }

  private loadCpi(profileId: string): void {
    if (!this.profiles) return;
    const { stages, stage } = this.profiles[profileId].cpiProfile;
    stages.forEach((_, i) => {
      this.manager.setCpiLevel(i, this.getKeyFromCpiValue(stages[i]));
    });
    this.manager.changeCurrentCpi(
      stage,
      this.getKeyFromCpiValue(stages[stage]),
    );
  }

  private async getCurrentInputBinding(): Promise<InputBindings> {
    try {
      return await this.manager.requestInputBindings();
    } catch (e) {
      throw new Error(ErrorMessages.INPUT);
    }
  }

  private async getCurrentCpi(): Promise<CpiProfile> {
    try {
      const currentCpi = await this.manager.requestCpiLevels();
      const cpiProfile = Array.from(
        { length: currentCpi.count },
        (_, i) => this.cpiCapabilities.levels[currentCpi.levels[i]],
      );
      return { stages: cpiProfile, stage: currentCpi.current };
    } catch (e) {
      throw new Error(ErrorMessages.CPI);
    }
  }

  private getKeyFromCpiValue(cpiValue: number): number {
    return this.invertedLevels[cpiValue];
  }
}
