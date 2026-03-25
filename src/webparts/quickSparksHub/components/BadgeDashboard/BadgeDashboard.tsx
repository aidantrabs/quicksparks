import * as React from 'react';
import { IUserBadge } from '../../models/IUserBadge';
import { filterBadgesByCategory, getUniqueCategories, searchBadges } from '../../utils/badgeUtils';
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
    const [selectedCategory, setSelectedCategory] = React.useState('');

    if (loading) {
        return <div className={styles.skeletonGrid}>{renderSkeletonCards(8)}</div>;
    }

    if (error) {
        return <EmptyState title="unable to load badges" message={error} />;
    }

    const categories = getUniqueCategories(badges);
    let filtered = badges;

    if (selectedCategory) {
        filtered = filterBadgesByCategory(filtered, selectedCategory);
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
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="filter by series"
                >
                    <option value="">all series</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>
            {filtered.length === 0 ? (
                <EmptyState title="no badges found" message="try adjusting your search or filter" />
            ) : (
                <div className={styles.grid}>
                    {filtered.map((badge) => (
                        <BadgeCard key={badge.sessionId} badge={badge} />
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
