const MONTHS = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];

const SHORT_MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function formatDate(date: Date): string {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatDateShort(date: Date): string {
    return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${displayHours}:${displayMinutes} ${period}`;
}

export function isUpcoming(date: Date): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date >= now;
}

export function calculateStreak(attendedDates: Date[]): number {
    if (attendedDates.length === 0) return 0;

    const sorted = attendedDates
        .map((d) => {
            const normalized = new Date(d.getTime());
            normalized.setHours(0, 0, 0, 0);
            return normalized.getTime();
        })
        .sort((a, b) => b - a);

    const unique: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
        if (i === 0 || sorted[i] !== sorted[i - 1]) {
            unique.push(sorted[i]);
        }
    }

    let streak = 1;
    const oneDay = 86400000;
    const oneWeek = 7 * oneDay;

    for (let i = 1; i < unique.length; i++) {
        const gap = unique[i - 1] - unique[i];
        if (gap <= oneWeek) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}
