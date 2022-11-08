type FrequencyOptions = {
  [index: string]: number;
};

const updateFrequencyOptions: FrequencyOptions = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

// 24 hours as milliseconds (1000 * 60 * 60 * 24) => 86,400,000
export const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

export const updateFrequency = (
  freq: string = Deno.env.get("updateFrequency") || "weekly",
) => {
  return updateFrequencyOptions[freq];
};
