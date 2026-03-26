import * as React from 'react';
import PlaceholderBadge from '../../../assets/PlaceholderBadge';
import { IUserBadge } from '../../../models/IUserBadge';
import { stripStudioPrefix } from '../../../utils/badgeUtils';
import { formatDateShort } from '../../../utils/dateUtils';
import styles from './BadgeCard.module.scss';

interface IBadgeCardProps {
    badge: IUserBadge;
}

const TIER_COLORS: Record<string, string> = {
    gold: '#d4a017',
    silver: '#8b919a',
    bronze: '#b87333',
};

const BadgeCard: React.FC<IBadgeCardProps> = ({ badge }) => {
    const studioName = stripStudioPrefix(badge.skillStudio);

    if (badge.tier === 'none') {
        return (
            <article className={styles.locked} aria-label={`${badge.title} - not yet earned`}>
                <div className={styles.lockedImage}>
                    <PlaceholderBadge size={100} />
                </div>
                <p className={styles.title}>{badge.title}</p>
                <span className={styles.lockLabel}>locked</span>
                <span className={styles.skillStudio}>{studioName}</span>
            </article>
        );
    }

    const tierColor = TIER_COLORS[badge.tier] || TIER_COLORS.gold;

    return (
        <article
            className={styles.card}
            aria-label={`${badge.title} - ${badge.tier} badge earned ${badge.earnedDate ? formatDateShort(badge.earnedDate) : ''}`}
        >
            {badge.badgeImageUrl ? (
                <img src={badge.badgeImageUrl} alt="" className={styles.badgeImage} />
            ) : (
                <div className={styles.badgeImage}>
                    <PlaceholderBadge size={100} />
                </div>
            )}
            <span className={styles.tierBadge} style={{ backgroundColor: tierColor }}>
                {badge.tier}
            </span>
            <p className={styles.title}>{badge.title}</p>
            {badge.earnedDate && <span className={styles.date}>{formatDateShort(badge.earnedDate)}</span>}
            <span className={styles.skillStudio}>{studioName}</span>
        </article>
    );
};

export default BadgeCard;
