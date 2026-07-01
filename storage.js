const STORAGE_KEY = "nutrition_tracker_v3_beta";
const MIGRATION_KEYS = [
  "nutrition_tracker_v2_4",
  "nutrition_tracker_v2_3",
  "nutrition_tracker_v2_2",
  "nutrition_tracker_v2_1",
  "nutrition_tracker_v2"
];

const DEFAULT_STATE = {
  lang: "zh",
  days: {},
  weights: {},
  collapsed: {},
  lastMeal: "lunch",
  ranges: {
    cal: { min: 2500, idealMax: 2800, unit: "kcal" },
    pro: { min: 140, idealMax: 160, unit: "g" },
    carb: { min: 320, idealMax: 380, unit: "g" },
    fat: { min: 60, idealMax: 80, unit: "g" }
  }
};

function loadState() {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) return normalizeState(JSON.parse(current));

  for (const key of MIGRATION_KEYS) {
    const old = localStorage.getItem(key);
    if (old) return normalizeState(JSON.parse(old));
  }

  return structuredClone(DEFAULT_STATE);
}

function normalizeState(input) {
  const state = structuredClone(DEFAULT_STATE);
  if (!input || typeof input !== "object") return state;

  state.lang = input.lang || state.lang;
  state.days = input.days || {};
  state.weights = input.weights || {};
  state.collapsed = input.collapsed || {};
  state.lastMeal = input.lastMeal || state.lastMeal;

  if (input.ranges) {
    for (const key of ["cal", "pro", "carb", "fat"]) {
      if (input.ranges[key]) {
        state.ranges[key].min = Number(input.ranges[key].min) || state.ranges[key].min;
        state.ranges[key].idealMax = Number(input.ranges[key].idealMax) || state.ranges[key].idealMax;
      }
    }
  }
  return state;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
