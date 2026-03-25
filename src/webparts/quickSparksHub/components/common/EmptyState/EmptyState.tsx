import * as React from 'react';
import styles from './EmptyState.module.scss';

interface IEmptyStateProps {
    title: string;
    message?: string;
}

const EmptyState: React.FC<IEmptyStateProps> = ({ title, message }) => {
    return (
        <div className={styles.emptyState}>
            <p className={styles.title}>{title}</p>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
};

export default EmptyState;
