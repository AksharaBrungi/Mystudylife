export interface StudyStats {
  sessionsCompleted: number;
  totalMinutes: number;
  streak: number;
  lastActiveDate: string | null;
  focusScore: number;
}

const STORAGE_KEY = 'msl_study_stats';

const defaultStats: StudyStats = {
  sessionsCompleted: 0,
  totalMinutes: 0,
  streak: 0,
  lastActiveDate: null,
  focusScore: 0,
};

export const getStudyStats = (): StudyStats => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultStats;
  try {
    const stats = JSON.parse(stored);
    // Check streak validity
    return validateStreak(stats);
  } catch {
    return defaultStats;
  }
};

const validateStreak = (stats: StudyStats): StudyStats => {
  if (!stats.lastActiveDate) return stats;

  const today = new Date().toDateString();
  const lastActive = new Date(stats.lastActiveDate).toDateString();
  
  if (today === lastActive) return stats;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (lastActive !== yesterdayStr) {
    // Streak broken
    const updated = { ...stats, streak: 0 };
    saveStudyStats(updated);
    return updated;
  }

  return stats;
};

export const saveStudyStats = (stats: StudyStats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

export const recordSession = (minutes: number) => {
  const stats = getStudyStats();
  const today = new Date().toDateString();
  const lastActive = stats.lastActiveDate ? new Date(stats.lastActiveDate).toDateString() : null;

  let newStreak = stats.streak;
  if (lastActive !== today) {
    newStreak += 1;
  }

  const newSessions = stats.sessionsCompleted + 1;
  const newTotalMinutes = stats.totalMinutes + minutes;
  
  // Dynamic Focus Score calculation
  // Base score on consistency (streak) and volume (sessions)
  // Max score 100
  const consistencyWeight = Math.min(newStreak * 5, 40); // Max 40 points for 8-day streak
  const volumeWeight = Math.min(newSessions * 2, 60);    // Max 60 points for 30 sessions
  const newFocusScore = consistencyWeight + volumeWeight;

  const updatedStats: StudyStats = {
    sessionsCompleted: newSessions,
    totalMinutes: newTotalMinutes,
    streak: newStreak,
    lastActiveDate: new Date().toISOString(),
    focusScore: newFocusScore,
  };

  saveStudyStats(updatedStats);
  return updatedStats;
};
