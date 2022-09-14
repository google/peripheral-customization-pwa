// levels: an array with the CPI for each enabled level, based off of the levels
// available from the mouse
export type CPILevels = Record<number, number>;

export type CurrentLevels = Record<number, number>;

// count: number of CPI indexes
// levels: map with values and names for the various levels
export type CPICapabilities = {
  count: number;
  levels: CPILevels;
};
