/**
 * Facebook-style relative time labels.
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = "en",
): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const seconds = Math.max(0, Math.floor((now - then.getTime()) / 1000));

  const isSo = locale === "so";

  if (seconds < 5) return isSo ? "hadda" : "just now";
  if (seconds < 60) {
    return isSo ? `${seconds} ilbiriqsi kahor` : `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return isSo
      ? `${minutes} daqiiqo${minutes === 1 ? "" : ""} kahor`
      : `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return isSo ? `${hours} saacadood kahor` : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return isSo
      ? `${days} maalin${days === 1 ? "" : "ood"} kahor`
      : `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return isSo ? `${weeks} toddobaad kahor` : `${weeks}w ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return isSo
      ? `${months} bil${months === 1 ? "" : "ood"} kahor`
      : months === 1
        ? "1 month ago"
        : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return isSo
    ? `${years} sano kahor`
    : years === 1
      ? "1 year ago"
      : `${years} years ago`;
}
