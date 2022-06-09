import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { InputBindings } from 'src/lib/ts/devices/components/inputs';
import { DPICapabilities } from 'src/lib/ts/devices/components/dpi';
import { ManagerService } from './manager.service';

enum ErrorMessages {
  CONSTRUCTOR = "Couldn't get device profiles",
  CREATE = "Couldn't create device profiles",
  SAVE = "Couldn't save the profile",
  INPUT = "Couldn't get current input bindings",
  DPI = "Coudn't get current dpi",
}

type InvertedLevels = Record<number, number>;

interface DpiProfile {
  stages: number[];
  stage: number;
}

export interface Profile {
  deviceId: string;
  dpiProfile: DpiProfile;
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

  dpiCapabilities!: DPICapabilities;

  invertedLevels!: InvertedLevels;

  constructor(private manager: ManagerService) {
    try {
      const vendorId = this.manager.device?.hidDevice.vendorId ?? 0;
      const productId = this.manager.device?.hidDevice.productId ?? 0;

      if (!this.manager.dpiCapabilities) return;
      this.dpiCapabilities = this.manager.dpiCapabilities;
      this.invertedLevels = Object.entries(this.dpiCapabilities.levels).reduce(
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
        dpiProfile: await this.getCurrentDpi(),
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
        dpiProfile: await this.getCurrentDpi(),
      };

      if (this.profiles) this.profiles[profileId] = newProfile;

      localStorage.setItem(this.deviceId, JSON.stringify(this.profiles));
    } catch (e) {
      throw new Error(ErrorMessages.SAVE);
    }
  }

  loadProfile(profileId: string): void {
    this.loadInput(profileId);
    this.loadDpi(profileId);
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

  private loadDpi(profileId: string): void {
    if (!this.profiles) return;
    const { stages, stage } = this.profiles[profileId].dpiProfile;
    stages.forEach((_, i) => {
      this.manager.setDpiLevel(i, this.getKeyFromDpiValue(stages[i]));
    });
    this.manager.changeCurrentDpi(
      stage,
      this.getKeyFromDpiValue(stages[stage]),
    );
  }

  private async getCurrentInputBinding(): Promise<InputBindings> {
    try {
      return await this.manager.requestInputBindings();
    } catch (e) {
      throw new Error(ErrorMessages.INPUT);
    }
  }

  private async getCurrentDpi(): Promise<DpiProfile> {
    try {
      const currentDpi = await this.manager.requestDpiLevels();
      const dpiProfile = Array.from(
        { length: currentDpi.count },
        (_, i) => this.dpiCapabilities.levels[currentDpi.levels[i]],
      );
      return { stages: dpiProfile, stage: currentDpi.current };
    } catch (e) {
      throw new Error(ErrorMessages.DPI);
    }
  }

  private getKeyFromDpiValue(dpiValue: number): number {
    return this.invertedLevels[dpiValue];
  }
}
