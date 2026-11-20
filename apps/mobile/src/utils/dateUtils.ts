/**
 * DevSutra Standardized Date and Time Formatting Utility
 * Ensures consistent, clean, and exact date-time formatting across mobile screens.
 */

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTHS_MR = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
];

/**
 * Format date string into "18 Nov 2026" or "१८ नोव्हेंबर २०२६"
 */
export function formatStandardDate(dateStr?: string | Date | null, isMarathi: boolean = false): string {
  if (!dateStr) return isMarathi ? 'आज' : 'Today';

  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) {
    // If it's already YYYY-MM-DD
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parts[2].slice(0, 2);
        if (isMarathi && MONTHS_MR[monthIndex]) {
          return `${day} ${MONTHS_MR[monthIndex]} ${year}`;
        }
        if (MONTHS_EN[monthIndex]) {
          return `${day} ${MONTHS_EN[monthIndex]} ${year}`;
        }
      }
    }
    return String(dateStr);
  }

  const day = String(d.getDate()).padStart(2, '0');
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  if (isMarathi) {
    return `${day} ${MONTHS_MR[monthIdx]} ${year}`;
  }
  return `${day} ${MONTHS_EN[monthIdx]} ${year}`;
}

/**
 * Format time string into "10:30 AM" or "सकाळी १०:३०"
 */
export function formatStandardTime(timeStr?: string | null, isMarathi: boolean = false): string {
  if (!timeStr) return isMarathi ? 'सकाळी ०८:००' : '08:00 AM';

  // If already like "07:00 AM - 10:00 AM" or "10:30 AM"
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    if (isMarathi) {
      return timeStr.replace('AM', 'सकाळी').replace('PM', 'संध्याकाळी');
    }
    return timeStr;
  }

  // If HH:MM:SS or HH:MM
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const minute = parts[1].slice(0, 2);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const formattedHour = String(hour).padStart(2, '0');

    if (isMarathi) {
      const prefix = ampm === 'AM' ? 'सकाळी' : 'संध्याकाळी';
      return `${prefix} ${formattedHour}:${minute}`;
    }
    return `${formattedHour}:${minute} ${ampm}`;
  }

  return timeStr;
}

/**
 * Format combined date and time: "18 Nov 2026, 10:30 AM"
 */
export function formatStandardDateTime(
  dateStr?: string | Date | null,
  timeStr?: string | null,
  isMarathi: boolean = false
): string {
  const d = formatStandardDate(dateStr, isMarathi);
  const t = formatStandardTime(timeStr, isMarathi);
  return `${d} • ${t}`;
}
