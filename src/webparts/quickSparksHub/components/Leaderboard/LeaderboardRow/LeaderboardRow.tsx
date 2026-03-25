import * as React from 'react';
import { ILeaderboardEntry } from '../../../models/ILeaderboardEntry';
import styles from './LeaderboardRow.module.scss';

interface ILeaderboardRowProps {
    entry: ILeaderboardEntry;
    index: number;
    maxPoints: number;
}

const LeaderboardRow: React.FC<ILeaderboardRowProps> = ({ entry, index, maxPoints }) => {
    const isTop3 = entry.rank <= 3;
    const delay = `${index * 50}ms`;
    const barWidth = maxPoints > 0 ? Math.round((entry.totalPoints / maxPoints) * 100) : 0;

    return (
        <li className={styles.row} style={{ animationDelay: delay }}>
            <span className={isTop3 ? styles.rankTop : styles.rank}>{entry.rank}</span>
            <div className={styles.info}>
                <p className={styles.division}>{entry.branchUnit}</p>
                <div className={styles.barContainer}>
                    <div className={styles.barFill} style={{ width: `${barWidth}%` }} />
                </div>
            </div>
            <div className={styles.stats}>
                <span className={styles.points}>{entry.totalPoints} pts</span>
                <span className={styles.badges}>{entry.totalBadges} badges</span>
            </div>
        </li>
    );
};

export default LeaderboardRow;
