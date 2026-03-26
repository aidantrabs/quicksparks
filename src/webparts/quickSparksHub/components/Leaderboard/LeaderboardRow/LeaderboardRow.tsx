import * as React from 'react';
import { ILeaderboardEntry } from '../../../models/ILeaderboardEntry';
import styles from './LeaderboardRow.module.scss';

interface ILeaderboardRowProps {
    entry: ILeaderboardEntry;
    index: number;
    maxBadges: number;
}

const LeaderboardRow: React.FC<ILeaderboardRowProps> = ({ entry, index, maxBadges }) => {
    const isTop3 = entry.rank <= 3;
    const delay = `${index * 50}ms`;
    const barWidth = maxBadges > 0 ? Math.round((entry.totalBadges / maxBadges) * 100) : 0;

    return (
        <li className={styles.row} style={{ animationDelay: delay }}>
            <span className={isTop3 ? styles.rankTop : styles.rank}>{entry.rank}</span>
            <div className={styles.info}>
                <p className={styles.division}>{entry.branchUnit}</p>
                <div className={styles.barContainer}>
                    <div className={styles.barFill} style={{ width: `${barWidth}%` }} />
                </div>
            </div>
            <span className={styles.badgeCount}>{entry.totalBadges} badges</span>
        </li>
    );
};

export default LeaderboardRow;
