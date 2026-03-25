import * as React from 'react';
import styles from './Skeleton.module.scss';

interface ISkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    count?: number;
    gap?: string;
}

const Skeleton: React.FC<ISkeletonProps> = ({ width = '100%', height = '16px', borderRadius, count = 1, gap }) => {
    if (count === 1) {
        return <div className={styles.skeleton} style={{ width, height, borderRadius }} aria-hidden="true" />;
    }

    const items: React.ReactElement[] = [];
    for (let i = 0; i < count; i++) {
        items.push(<div key={i} className={styles.skeleton} style={{ width, height, borderRadius }} />);
    }

    return (
        <div className={styles.skeletonGroup} style={{ gap }} aria-hidden="true">
            {items}
        </div>
    );
};

export default Skeleton;
