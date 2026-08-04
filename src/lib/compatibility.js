// RoomieFit Compatibility Scoring Logic
// Extracted from PRD Section 7

/**
 * Computes roommate compatibility score between profileA and profileB (0 - 100).
 * Returns { score, breakdown }
 */
export function computeCompatibility(profileA, profileB) {
  if (!profileA || !profileB) {
    return { score: 0, breakdown: {} };
  }

  // 1. City Match (Weight: 15)
  const cityA = (profileA.targetCity || "").trim().toLowerCase();
  const cityB = (profileB.targetCity || "").trim().toLowerCase();
  const cityScore = (cityA && cityB && cityA === cityB) ? 15 : 0;

  // 2. Budget Overlap (Weight: 15)
  let budgetScore = 0;
  const aMin = profileA.budgetMin || 0;
  const aMax = profileA.budgetMax || Infinity;
  const bMin = profileB.budgetMin || 0;
  const bMax = profileB.budgetMax || Infinity;

  const overlapMin = Math.max(aMin, bMin);
  const overlapMax = Math.min(aMax, bMax);

  if (overlapMax >= overlapMin) {
    // There is an overlapping range
    budgetScore = 15;
  } else {
    // Scale points down based on gap relative to max budget limit
    const gap = overlapMin - overlapMax;
    const maxBudget = Math.max(aMax === Infinity ? 0 : aMax, bMax === Infinity ? 0 : bMax) || 1000;
    budgetScore = Math.max(0, Math.round(15 * (1 - gap / maxBudget)));
  }

  // 3. Sleep Schedule (Weight: 15)
  let sleepScore = 0;
  if (profileA.sleepSchedule && profileB.sleepSchedule) {
    if (profileA.sleepSchedule === profileB.sleepSchedule) {
      sleepScore = 15;
    } else if (profileA.sleepSchedule === "flexible" || profileB.sleepSchedule === "flexible") {
      sleepScore = 10;
    }
  }

  // 4. Cleanliness (Weight: 15)
  let cleanlinessScore = 0;
  if (profileA.cleanliness !== undefined && profileB.cleanliness !== undefined) {
    const cleanDiff = Math.abs(profileA.cleanliness - profileB.cleanliness);
    if (cleanDiff <= 1) cleanlinessScore = 15;
    else if (cleanDiff === 2) cleanlinessScore = 10;
    else if (cleanDiff === 3) cleanlinessScore = 5;
  }

  // 5. Food Preference (Weight: 10)
  let foodScore = 0;
  if (profileA.foodPreference && profileB.foodPreference) {
    const fA = profileA.foodPreference;
    const fB = profileB.foodPreference;
    if (fA === fB) {
      foodScore = 10;
    } else if (
      fA === "no_preference" || fB === "no_preference" ||
      (fA === "veg" && fB === "vegan") || (fA === "vegan" && fB === "veg")
    ) {
      foodScore = 7;
    }
  }

  // 6. Smoking / Drinking Combined (Weight: 10)
  let smokingScore = 0;
  if (profileA.smoking && profileB.smoking) {
    if (profileA.smoking === profileB.smoking) {
      smokingScore = 5;
    } else if (profileA.smoking === "occasionally" || profileB.smoking === "occasionally") {
      smokingScore = 3;
    }
  }

  let drinkingScore = 0;
  if (profileA.drinking && profileB.drinking) {
    if (profileA.drinking === profileB.drinking) {
      drinkingScore = 5;
    } else if (profileA.drinking === "occasionally" || profileB.drinking === "occasionally") {
      drinkingScore = 3;
    }
  }
  const smokingDrinkingScore = smokingScore + drinkingScore;

  // 7. Socializing / Guests (Weight: 10)
  let socializingScore = 0;
  if (profileA.socializing && profileB.socializing) {
    const mapSocial = { rarely: 1, sometimes: 2, often: 3 };
    const sA = mapSocial[profileA.socializing] || 2;
    const sB = mapSocial[profileB.socializing] || 2;
    const socialDiff = Math.abs(sA - sB);
    if (socialDiff === 0) socializingScore = 10;
    else if (socialDiff === 1) socializingScore = 6;
  }

  // 8. Noise Tolerance (Weight: 10)
  let noiseScore = 0;
  if (profileA.noiseTolerance && profileB.noiseTolerance) {
    const mapNoise = { quiet: 1, moderate: 2, dont_mind: 3 };
    const nA = mapNoise[profileA.noiseTolerance] || 2;
    const nB = mapNoise[profileB.noiseTolerance] || 2;
    const noiseDiff = Math.abs(nA - nB);
    if (noiseDiff === 0) noiseScore = 10;
    else if (noiseDiff === 1) noiseScore = 6;
  }

  const score = cityScore + budgetScore + sleepScore + cleanlinessScore + foodScore + smokingDrinkingScore + socializingScore + noiseScore;

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    breakdown: {
      city: cityScore,
      budget: budgetScore,
      sleep: sleepScore,
      cleanliness: cleanlinessScore,
      food: foodScore,
      smokingDrinking: smokingDrinkingScore,
      socializing: socializingScore,
      noise: noiseScore,
    },
  };
}

/**
 * Returns matching bucket labels and Tailwind colors for score badges.
 */
export function matchLabel(score) {
  if (score >= 80) {
    return { label: "Great Match", color: "emerald" };
  } else if (score >= 60) {
    return { label: "Good Match", color: "blue" };
  } else if (score >= 40) {
    return { label: "Fair Match", color: "amber" };
  } else {
    return { label: "Low Match", color: "rose" };
  }
}
