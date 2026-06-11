export const parseDbTimeToDate = (timeString: string | null | undefined): Date | null => {
  if (!timeString) return null;
  const parts = timeString.split(':').map(Number);
  const d = new Date();
  d.setHours(parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0);
  return d;
};

export const formatTimeForDb = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toTimeString().split(' ')[0] ?? null; // Returns 'HH:MM:SS'
};

export const getRoundedDate = (date: Date = new Date()): Date => {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const remainder = minutes % 15;
  if (remainder !== 0) {
    rounded.setMinutes(minutes + (15 - remainder));
  }
  rounded.setSeconds(0);
  rounded.setMilliseconds(0);
  return rounded;
};
