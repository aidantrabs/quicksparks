import * as React from 'react';
import { IUserBadge } from '../../models/IUserBadge';
import {
    filterBadgesBySkillStudio,
    getUniqueSkillStudios,
    searchBadges,
    stripStudioPrefix,
} from '../../utils/badgeUtils';
import EmptyState from '../common/EmptyState/EmptyState';
import Skeleton from '../common/Skeleton/Skeleton';
import BadgeCard from './BadgeCard/BadgeCard';
import styles from './BadgeDashboard.module.scss';

interface IBadgeDashboardProps {
    badges: IUserBadge[];
    loading: boolean;
    error: string | null;
}

const BadgeDashboard: React.FC<IBadgeDashboardProps> = ({ badges, loading, error }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedStudio, setSelectedStudio] = React.useState('');

    if (loading) {
        return <div className={styles.skeletonGrid}>{renderSkeletonCards(8)}</div>;
    }

    if (error) {
        return <EmptyState title="unable to load badges" message={error} />;
    }

    const studios = getUniqueSkillStudios(badges);
    let filtered = badges;

    if (selectedStudio) {
        filtered = filterBadgesBySkillStudio(filtered, selectedStudio);
    }

    if (searchQuery) {
        filtered = searchBadges(filtered, searchQuery);
    }

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="search badges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="search badges"
                />
                <select
                    className={styles.filterSelect}
                    value={selectedStudio}
                    onChange={(e) => setSelectedStudio(e.target.value)}
                    aria-label="filter by skill studio"
                >
                    <option value="">all skill studios</option>
                    {studios.map((studio) => (
                        <option key={studio} value={studio}>
                            {stripStudioPrefix(studio)}
                        </option>
                    ))}
                </select>
            </div>
            {filtered.length === 0 ? (
                <EmptyState title="no badges found" message="try adjusting your search or filter" />
            ) : (
                <div className={styles.grid}>
                    {filtered.map((badge) => (
                        <BadgeCard key={badge.trainingCode} badge={badge} />
                    ))}
                </div>
            )}
        </div>
    );
};

function renderSkeletonCards(count: number): React.ReactElement[] {
    const cards: React.ReactElement[] = [];
    for (let i = 0; i < count; i++) {
        cards.push(
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Skeleton width="100px" height="100px" borderRadius="50%" />
                <Skeleton width="80%" height="14px" />
                <Skeleton width="60%" height="12px" />
            </div>,
        );
    }
    return cards;
}

export default BadgeDashboard;
