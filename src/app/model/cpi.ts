import { CurrentLevels } from 'src/lib/ts/devices/components/cpi';

export type cpi = {
  count: number;
  current: number;
  levels: CurrentLevels;
};

export type CpiValue = {
  id: number;
  level: number;
};
