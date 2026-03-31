const BADGE_IMAGE_MAP: Record<string, string> = {
    '4.1': require('../assets/badges/liquidity-matters.png'),
    '11.1': require('../assets/badges/welcoming-entertaining-guests.png'),
    '3.4': require('../assets/badges/diagnosing-drama.png'),
    '3.5': require('../assets/badges/turning-my-job.png'),
    '1.2': require('../assets/badges/beyond-words.png'),
    '5.2': require('../assets/badges/excellence-unlocked.png'),
    '1.3': require('../assets/badges/active-listening-mastery.png'),
};

export function getBadgeImageUrl(trainingCode: string): string {
    return BADGE_IMAGE_MAP[trainingCode] || '';
}
