/**
 * WHO Child Growth Standards — reference curves for chart overlays
 *
 * Source: WorldHealthOrganization/anthro (GitHub), data-raw/growthstandards/
 * Files used: weianthro.txt, lenanthro.txt, hcanthro.txt
 * LMS formula: X = M * (1 + L*S*z)^(1/L)   (L≠0)
 *              X = M * exp(S*z)              (L=0)
 *
 * Three reference lines per metric / sex / age:
 *   neg2  = –2 SD  ≈ 2.3rd percentile  (lower bound)
 *   med   =  0 SD  = 50th percentile   (median)
 *   pos2  = +2 SD  ≈ 97.7th percentile (upper bound)
 *
 * Ages: 0–6 monthly, then 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60 months.
 * Units: weight → kg, length/height → cm, head circumference → cm.
 */

export type GrowthPoint = { neg2: number; med: number; pos2: number };
export type GrowthSeries = Record<number, GrowthPoint>; // key = age in months
export type GrowthMetric = { boys: GrowthSeries; girls: GrowthSeries };

export interface WHOGrowthStandards {
  weight: GrowthMetric;
  length: GrowthMetric;
  headcirc: GrowthMetric;
}

export const WHO_GROWTH: WHOGrowthStandards = {
  weight: {
    boys: {
      0:  { neg2: 2.459, med: 3.346, pos2: 4.419 },
      1:  { neg2: 3.376, med: 4.452, pos2: 5.776 },
      2:  { neg2: 4.322, med: 5.571, pos2: 7.095 },
      3:  { neg2: 5.012, med: 6.369, pos2: 8.016 },
      4:  { neg2: 5.565, med: 7.007, pos2: 8.752 },
      5:  { neg2: 5.994, med: 7.508, pos2: 9.339 },
      6:  { neg2: 6.357, med: 7.939, pos2: 9.855 },
      9:  { neg2: 7.145, med: 8.902, pos2: 11.042 },
      12: { neg2: 7.741, med: 9.646, pos2: 11.983 },
      15: { neg2: 8.267, med: 10.314, pos2: 12.841 },
      18: { neg2: 8.753, med: 10.939, pos2: 13.657 },
      21: { neg2: 9.223, med: 11.554, pos2: 14.472 },
      24: { neg2: 9.675, med: 12.155, pos2: 15.281 },
      30: { neg2: 10.524, med: 13.305, pos2: 16.861 },
      36: { neg2: 11.280, med: 14.344, pos2: 18.315 },
      42: { neg2: 12.007, med: 15.352, pos2: 19.740 },
      48: { neg2: 12.713, med: 16.349, pos2: 21.181 },
      54: { neg2: 13.400, med: 17.347, pos2: 22.664 },
      60: { neg2: 14.067, med: 18.335, pos2: 24.163 },
    },
    girls: {
      0:  { neg2: 2.395, med: 3.232, pos2: 4.230 },
      1:  { neg2: 3.148, med: 4.172, pos2: 5.456 },
      2:  { neg2: 3.944, med: 5.131, pos2: 6.634 },
      3:  { neg2: 4.531, med: 5.839, pos2: 7.506 },
      4:  { neg2: 5.017, med: 6.428, pos2: 8.239 },
      5:  { neg2: 5.402, med: 6.896, pos2: 8.826 },
      6:  { neg2: 5.733, med: 7.302, pos2: 9.341 },
      9:  { neg2: 6.473, med: 8.226, pos2: 10.547 },
      12: { neg2: 7.041, med: 8.946, pos2: 11.506 },
      15: { neg2: 7.562, med: 9.604, pos2: 12.375 },
      18: { neg2: 8.061, med: 10.232, pos2: 13.198 },
      21: { neg2: 8.555, med: 10.859, pos2: 14.023 },
      24: { neg2: 9.039, med: 11.481, pos2: 14.850 },
      30: { neg2: 9.975, med: 12.711, pos2: 16.521 },
      36: { neg2: 10.806, med: 13.852, pos2: 18.140 },
      42: { neg2: 11.589, med: 14.976, pos2: 19.817 },
      48: { neg2: 12.323, med: 16.070, pos2: 21.508 },
      54: { neg2: 13.044, med: 17.157, pos2: 23.222 },
      60: { neg2: 13.742, med: 18.218, pos2: 24.914 },
    },
  },

  length: {
    boys: {
      0:  { neg2: 46.098, med: 49.884, pos2: 53.670 },
      1:  { neg2: 50.773, med: 54.664, pos2: 58.556 },
      2:  { neg2: 54.438, med: 58.438, pos2: 62.439 },
      3:  { neg2: 57.313, med: 61.401, pos2: 65.489 },
      4:  { neg2: 59.741, med: 63.904, pos2: 68.067 },
      5:  { neg2: 61.669, med: 65.891, pos2: 70.114 },
      6:  { neg2: 63.362, med: 67.644, pos2: 71.925 },
      9:  { neg2: 67.485, med: 71.971, pos2: 76.458 },
      12: { neg2: 70.987, med: 75.739, pos2: 80.491 },
      15: { neg2: 74.100, med: 79.161, pos2: 84.223 },
      18: { neg2: 76.868, med: 82.263, pos2: 87.658 },
      21: { neg2: 79.408, med: 85.159, pos2: 90.911 },
      24: { neg2: 81.017, med: 87.130, pos2: 93.243 },
      30: { neg2: 85.140, med: 91.954, pos2: 98.768 },
      36: { neg2: 88.675, med: 96.089, pos2: 103.503 },
      42: { neg2: 91.933, med: 99.864, pos2: 107.795 },
      48: { neg2: 94.939, med: 103.327, pos2: 111.715 },
      54: { neg2: 97.843, med: 106.674, pos2: 115.504 },
      60: { neg2: 100.692, med: 109.959, pos2: 119.227 },
    },
    girls: {
      0:  { neg2: 45.422, med: 49.148, pos2: 52.873 },
      1:  { neg2: 49.727, med: 53.633, pos2: 57.538 },
      2:  { neg2: 53.006, med: 57.080, pos2: 61.153 },
      3:  { neg2: 55.569, med: 59.777, pos2: 63.986 },
      4:  { neg2: 57.777, med: 62.107, pos2: 66.437 },
      5:  { neg2: 59.585, med: 64.019, pos2: 68.453 },
      6:  { neg2: 61.217, med: 65.751, pos2: 70.285 },
      9:  { neg2: 65.315, med: 70.146, pos2: 74.978 },
      12: { neg2: 68.856, med: 74.005, pos2: 79.154 },
      15: { neg2: 72.046, med: 77.526, pos2: 83.005 },
      18: { neg2: 74.904, med: 80.712, pos2: 86.520 },
      21: { neg2: 77.554, med: 83.691, pos2: 89.827 },
      24: { neg2: 79.276, med: 85.730, pos2: 92.184 },
      30: { neg2: 83.640, med: 90.702, pos2: 97.764 },
      36: { neg2: 87.439, med: 95.057, pos2: 102.675 },
      42: { neg2: 90.925, med: 99.058, pos2: 107.191 },
      48: { neg2: 94.116, med: 102.731, pos2: 111.346 },
      54: { neg2: 97.110, med: 106.182, pos2: 115.254 },
      60: { neg2: 99.908, med: 109.419, pos2: 118.930 },
    },
  },

  headcirc: {
    boys: {
      0:  { neg2: 31.921, med: 34.462, pos2: 37.002 },
      1:  { neg2: 34.908, med: 37.243, pos2: 39.579 },
      2:  { neg2: 36.789, med: 39.135, pos2: 41.481 },
      3:  { neg2: 38.137, med: 40.501, pos2: 42.864 },
      4:  { neg2: 39.252, med: 41.640, pos2: 44.029 },
      5:  { neg2: 40.138, med: 42.552, pos2: 44.967 },
      6:  { neg2: 40.898, med: 43.339, pos2: 45.781 },
      9:  { neg2: 42.488, med: 45.001, pos2: 47.514 },
      12: { neg2: 43.494, med: 46.064, pos2: 48.633 },
      15: { neg2: 44.195, med: 46.809, pos2: 49.423 },
      18: { neg2: 44.719, med: 47.372, pos2: 50.025 },
      21: { neg2: 45.156, med: 47.845, pos2: 50.533 },
      24: { neg2: 45.531, med: 48.254, pos2: 50.976 },
      30: { neg2: 46.151, med: 48.938, pos2: 51.725 },
      36: { neg2: 46.622, med: 49.462, pos2: 52.302 },
      42: { neg2: 46.990, med: 49.876, pos2: 52.762 },
      48: { neg2: 47.287, med: 50.212, pos2: 53.136 },
      54: { neg2: 47.534, med: 50.493, pos2: 53.452 },
      60: { neg2: 47.749, med: 50.737, pos2: 53.726 },
    },
    girls: {
      0:  { neg2: 31.510, med: 33.879, pos2: 36.247 },
      1:  { neg2: 34.171, med: 36.516, pos2: 38.861 },
      2:  { neg2: 35.834, med: 38.258, pos2: 40.682 },
      3:  { neg2: 37.039, med: 39.521, pos2: 42.003 },
      4:  { neg2: 38.058, med: 40.590, pos2: 43.121 },
      5:  { neg2: 38.882, med: 41.454, pos2: 44.026 },
      6:  { neg2: 39.602, med: 42.208, pos2: 44.814 },
      9:  { neg2: 41.155, med: 43.831, pos2: 46.507 },
      12: { neg2: 42.176, med: 44.894, pos2: 47.612 },
      15: { neg2: 42.914, med: 45.658, pos2: 48.402 },
      18: { neg2: 43.481, med: 46.243, pos2: 49.006 },
      21: { neg2: 43.965, med: 46.743, pos2: 49.520 },
      24: { neg2: 44.394, med: 47.184, pos2: 49.975 },
      30: { neg2: 45.125, med: 47.937, pos2: 50.749 },
      36: { neg2: 45.685, med: 48.511, pos2: 51.336 },
      42: { neg2: 46.130, med: 48.964, pos2: 51.798 },
      48: { neg2: 46.493, med: 49.332, pos2: 52.172 },
      54: { neg2: 46.804, med: 49.647, pos2: 52.490 },
      60: { neg2: 47.077, med: 49.922, pos2: 52.768 },
    },
  },
};

/**
 * Returns the two nearest age anchor points for linear interpolation.
 * Pass ageMonths (can be fractional) and the sorted age keys for a metric/sex.
 */
export function interpolateGrowthPoint(
  series: GrowthSeries,
  ageMonths: number
): GrowthPoint {
  const ages = Object.keys(series).map(Number).sort((a, b) => a - b);
  if (ageMonths <= ages[0]) return series[ages[0]];
  if (ageMonths >= ages[ages.length - 1]) return series[ages[ages.length - 1]];

  let lo = ages[0];
  let hi = ages[ages.length - 1];
  for (let i = 0; i < ages.length - 1; i++) {
    if (ages[i] <= ageMonths && ageMonths <= ages[i + 1]) {
      lo = ages[i];
      hi = ages[i + 1];
      break;
    }
  }

  const t = (ageMonths - lo) / (hi - lo);
  const lerp = (a: number, b: number) => Math.round((a + t * (b - a)) * 1000) / 1000;
  return {
    neg2: lerp(series[lo].neg2, series[hi].neg2),
    med:  lerp(series[lo].med,  series[hi].med),
    pos2: lerp(series[lo].pos2, series[hi].pos2),
  };
}
