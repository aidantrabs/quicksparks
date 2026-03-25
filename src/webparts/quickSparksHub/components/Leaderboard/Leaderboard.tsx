import * as React from 'react';
import { ILeaderboardEntry } from '../../models/ILeaderboardEntry';
import EmptyState from '../common/EmptyState/EmptyState';
import Skeleton from '../common/Skeleton/Skeleton';
import styles from './Leaderboard.module.scss';
import LeaderboardRow from './LeaderboardRow/LeaderboardRow';

interface ILeaderboardProps {
    entries: ILeaderboardEntry[];
    loading: boolean;
    error: string | null;
}

const Leaderboard: React.FC<ILeaderboardProps> = ({ entries, loading, error }) => {
    if (loading) {
        return <div className={styles.skeletonList}>{renderSkeletonRows(6)}</div>;
    }

    if (error) {
        return <EmptyState title="unable to load leaderboard" message={error} />;
    }

    if (entries.length === 0) {
        return <EmptyState title="no leaderboard data" message="attendance data is needed to generate rankings" />;
    }

    const maxPoints = entries.length > 0 ? entries[0].totalPoints : 1;

    return (
        <div className={styles.container}>
            <ol className={styles.list} aria-label="branch/unit leaderboard">
                {entries.map((entry, index) => (
                    <LeaderboardRow key={entry.branchUnit} entry={entry} index={index} maxPoints={maxPoints} />
                ))}
            </ol>
        </div>
    );
};

function renderSkeletonRows(count: number): React.ReactElement[] {
    const rows: React.ReactElement[] = [];
    for (let i = 0; i < count; i++) {
        rows.push(
            <div key={i} className={styles.skeletonRow}>
                <Skeleton width="32px" height="28px" borderRadius="4px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Skeleton width="60%" height="16px" />
                    <Skeleton width="100%" height="6px" borderRadius="9999px" />
                </div>
                <Skeleton width="48px" height="16px" />
            </div>,
        );
    }
    return rows;
}

export default Leaderboard;
