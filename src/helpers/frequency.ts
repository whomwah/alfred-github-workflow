type FrequencyOptions = {
  [index: string]: number;
};

const updateFrequencyOptions: FrequencyOptions = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

export const TWENTY_FOUR_HOURS = 60 * 60 * 24; // 24 hours in seconds

export const updateFrequency = (
  freq: string = Deno.env.get("updateFrequency") || "weekly",
) => {
  return updateFrequencyOptions[freq];
};

export const cacheUpdateFrequency = (
  freq: string = Deno.env.get("cacheCheckFrequency") || "weekly",
) => {
  return updateFrequencyOptions[freq];
};
