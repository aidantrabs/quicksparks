import * as React from 'react';
import PlaceholderBadge from '../../../assets/PlaceholderBadge';
import { IUserBadge } from '../../../models/IUserBadge';
import { formatDateShort } from '../../../utils/dateUtils';
import styles from './BadgeCard.module.scss';

interface IBadgeCardProps {
    badge: IUserBadge;
}

const BadgeCard: React.FC<IBadgeCardProps> = ({ badge }) => {
    const separatorIndex = badge.title.indexOf(' - "');
    const shortTitle = separatorIndex !== -1 ? badge.title.split(' - "')[1].replace(/"$/, '') : badge.title;

    if (!badge.earned) {
        return (
            <article className={styles.locked} aria-label={`${shortTitle} badge - not yet earned`}>
                {badge.badgeImageUrl ? (
                    <img src={badge.badgeImageUrl} alt="" className={styles.lockedImage} />
                ) : (
                    <div className={styles.lockedImage}>
                        <PlaceholderBadge size={100} />
                    </div>
                )}
                <p className={styles.title}>{shortTitle}</p>
                <span className={styles.lockLabel}>locked</span>
                <span className={styles.category}>{badge.category}</span>
            </article>
        );
    }

    return (
        <article
            className={styles.card}
            aria-label={`${shortTitle} badge - earned ${badge.earnedDate ? formatDateShort(badge.earnedDate) : ''}`}
        >
            {badge.badgeImageUrl ? (
                <img src={badge.badgeImageUrl} alt="" className={styles.badgeImage} />
            ) : (
                <div className={styles.badgeImage}>
                    <PlaceholderBadge size={100} />
                </div>
            )}
            <p className={styles.title}>{shortTitle}</p>
            {badge.earnedDate && <span className={styles.date}>{formatDateShort(badge.earnedDate)}</span>}
            <span className={styles.category}>{badge.category}</span>
        </article>
    );
};

export default BadgeCard;
