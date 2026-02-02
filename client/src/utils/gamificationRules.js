// client/src/utils/gamificationRules.js
// reguli simple, fara complexitate

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400]; // puncte minime pe nivel

export const ACTION_POINTS = {
  CONTEST_JOIN: 25,
  CONTEST_POST: 50,
  DAILY_LOGIN: 10,
};

export const BADGES = [
  { key: "first_points", name: "First Steps", icon: "✨", rule: (g) => (g.points ?? 0) >= 10 },
  { key: "contest_joiner", name: "Brave Competitor", icon: "🏆", rule: (g) => (g.contestJoins ?? 0) >= 1 },
  { key: "level_3", name: "Rising Star", icon: "⭐", rule: (g) => (g.level ?? 1) >= 3 },
];

export function getLevelFromPoints(points = 0) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export function getNextLevelInfo(points = 0) {
  const level = getLevelFromPoints(points);
  const currentMin = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextMin = LEVEL_THRESHOLDS[level] ?? (currentMin + 500);
  const span = Math.max(1, nextMin - currentMin);

  const intoLevel = Math.max(0, points - currentMin);
  const progress = Math.min(100, Math.round((intoLevel / span) * 100));
  const remaining = Math.max(0, nextMin - points);

  return { level, currentMin, nextMin, progress, remaining };
}

export function normalizeGamification(g = {}) {
  const points = Number(g?.points ?? 0);
  const level = Number(g?.level ?? getLevelFromPoints(points));
  const badges = Array.isArray(g?.badges) ? g.badges : [];
  return { ...g, points, level, badges };
}

export function applyPointsAndBadges(g, addPoints = 0, extra = {}) {
  const base = normalizeGamification({ ...g, ...extra });
  const points = base.points + addPoints;
  const level = getLevelFromPoints(points);

  const existingKeys = new Set((base.badges || []).map((b) => b.key));
  const computed = { ...base, points, level };

  const newBadges = [];
  for (const b of BADGES) {
    if (!existingKeys.has(b.key) && b.rule(computed)) {
      newBadges.push({ key: b.key, name: b.name, icon: b.icon });
    }
  }

  return {
    ...computed,
    badges: [...base.badges, ...newBadges],
    _newBadges: newBadges, // pentru feedback UI
  };
}