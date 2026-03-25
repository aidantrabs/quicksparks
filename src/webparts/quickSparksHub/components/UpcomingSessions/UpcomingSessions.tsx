import * as React from 'react';
import { ISession } from '../../models/ISession';
import EmptyState from '../common/EmptyState/EmptyState';
import Skeleton from '../common/Skeleton/Skeleton';
import SessionCard from './SessionCard/SessionCard';
import styles from './UpcomingSessions.module.scss';

interface IUpcomingSessionsProps {
    sessions: ISession[];
    loading: boolean;
    error: string | null;
}

const UpcomingSessions: React.FC<IUpcomingSessionsProps> = ({ sessions, loading, error }) => {
    if (loading) {
        return <div className={styles.skeletonList}>{renderSkeletonCards(4)}</div>;
    }

    if (error) {
        return <EmptyState title="unable to load sessions" message={error} />;
    }

    if (sessions.length === 0) {
        return <EmptyState title="no upcoming sessions" message="check back soon for new quicksparks sessions" />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {sessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                ))}
            </div>
        </div>
    );
};

function renderSkeletonCards(count: number): React.ReactElement[] {
    const cards: React.ReactElement[] = [];
    for (let i = 0; i < count; i++) {
        cards.push(
            <div key={i} className={styles.skeletonCard}>
                <Skeleton width="56px" height="56px" borderRadius="6px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Skeleton width="70%" height="16px" />
                    <Skeleton width="100%" height="12px" />
                    <Skeleton width="80px" height="18px" borderRadius="9999px" />
                </div>
            </div>,
        );
    }
    return cards;
}

export default UpcomingSessions;
